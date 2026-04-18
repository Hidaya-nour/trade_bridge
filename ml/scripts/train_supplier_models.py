from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train supplier recommendation classifiers and evaluate.")
    parser.add_argument(
        "--dataset-file",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "processed" / "recommendation_dataset.csv",
    )
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "models",
    )
    parser.add_argument(
        "--metrics-file",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "processed" / "supplier_model_metrics.json",
    )
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def build_preprocessor(numeric_features: List[str], categorical_features: List[str]) -> ColumnTransformer:
    num_pipe = Pipeline(steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
    cat_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)),
        ]
    )
    return ColumnTransformer(transformers=[("num", num_pipe, numeric_features), ("cat", cat_pipe, categorical_features)])


def compute_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> Dict[str, float]:
    y_pred = (y_prob >= threshold).astype(int)
    result = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
    }
    result["roc_auc"] = float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 0.0
    return result


def rule_score(frame: pd.DataFrame) -> np.ndarray:
    rating_norm = ((frame["supplier_avg_rating"] - 1.0) / 4.0).clip(0, 1).fillna(0.5)
    on_time = frame["supplier_on_time_rate"].clip(0, 1).fillna(0.5)
    price_norm = (frame["price_competitiveness"] / 2.0).clip(0, 1).fillna(0.5)
    return (0.4 * rating_norm + 0.4 * on_time + 0.2 * price_norm).to_numpy(dtype=float)


def evaluate_hybrid(model: Pipeline, train_df: pd.DataFrame, eval_df: pd.DataFrame, feature_cols: List[str]) -> Tuple[np.ndarray, Dict[str, int]]:
    eval_probs = model.predict_proba(eval_df[feature_cols])[:, 1]
    seen_retailers = set(train_df["retailer_id"].astype(str).unique().tolist())
    seen_suppliers = set(train_df["supplier_id"].astype(str).unique().tolist())
    cold_mask = (~eval_df["retailer_id"].astype(str).isin(seen_retailers) | ~eval_df["supplier_id"].astype(str).isin(seen_suppliers))
    fallback_probs = rule_score(eval_df)
    hybrid_probs = np.where(cold_mask.to_numpy(), fallback_probs, eval_probs)
    return hybrid_probs, {"cold_start_rows": int(cold_mask.sum()), "ml_rows": int((~cold_mask).sum())}


def main() -> None:
    args = parse_args()
    df = pd.read_csv(args.dataset_file, parse_dates=["order_purchase_timestamp"])
    train_df = df[df["split"] == "train"].copy()
    valid_df = df[df["split"] == "valid"].copy()
    test_df = df[df["split"] == "test"].copy()

    numeric_features = [
        "price_competitiveness",
        "supplier_on_time_rate",
        "supplier_avg_rating",
        "supplier_avg_fulfillment_days",
        "communication_responsiveness_score",
        "supplier_total_orders",
        "supplier_global_orders_before",
        "retailer_supplier_orders_before",
        "retailer_product_orders_before",
    ]
    categorical_features = ["retailer_id", "product_id", "supplier_id"]
    feature_cols = numeric_features + categorical_features

    preprocessor = build_preprocessor(numeric_features, categorical_features)
    y_train = train_df["label"].astype(int).to_numpy()
    y_valid = valid_df["label"].astype(int).to_numpy()
    y_test = test_df["label"].astype(int).to_numpy()

    dt_model = Pipeline(
        steps=[
            ("prep", preprocessor),
            ("clf", DecisionTreeClassifier(max_depth=10, min_samples_leaf=10, class_weight="balanced", random_state=args.seed)),
        ]
    )
    rf_model = Pipeline(
        steps=[
            ("prep", preprocessor),
            ("clf", RandomForestClassifier(n_estimators=300, max_depth=None, min_samples_leaf=5, class_weight="balanced", n_jobs=1, random_state=args.seed)),
        ]
    )

    dt_model.fit(train_df[feature_cols], y_train)
    rf_model.fit(train_df[feature_cols], y_train)

    dt_valid_prob = dt_model.predict_proba(valid_df[feature_cols])[:, 1]
    dt_test_prob = dt_model.predict_proba(test_df[feature_cols])[:, 1]
    rf_valid_prob = rf_model.predict_proba(valid_df[feature_cols])[:, 1]
    rf_test_prob = rf_model.predict_proba(test_df[feature_cols])[:, 1]
    hybrid_valid_prob, valid_meta = evaluate_hybrid(rf_model, train_df, valid_df, feature_cols)
    hybrid_test_prob, test_meta = evaluate_hybrid(rf_model, train_df, test_df, feature_cols)

    metrics = {
        "decision_tree": {"valid": compute_metrics(y_valid, dt_valid_prob), "test": compute_metrics(y_test, dt_test_prob)},
        "random_forest": {"valid": compute_metrics(y_valid, rf_valid_prob), "test": compute_metrics(y_test, rf_test_prob)},
        "hybrid_random_forest": {
            "valid": compute_metrics(y_valid, hybrid_valid_prob),
            "test": compute_metrics(y_test, hybrid_test_prob),
            "cold_start": {"valid": valid_meta, "test": test_meta},
        },
        "dataset": {
            "train_rows": int(len(train_df)),
            "valid_rows": int(len(valid_df)),
            "test_rows": int(len(test_df)),
            "positive_rate_train": float(y_train.mean()),
        },
    }

    args.models_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(dt_model, args.models_dir / "supplier_decision_tree.joblib")
    joblib.dump(rf_model, args.models_dir / "supplier_random_forest.joblib")
    args.metrics_file.parent.mkdir(parents=True, exist_ok=True)
    args.metrics_file.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
