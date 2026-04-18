from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder, StandardScaler


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train demand forecasting regressors and evaluate.")
    parser.add_argument(
        "--dataset-file",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "processed" / "demand_dataset.csv",
    )
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "models",
    )
    parser.add_argument(
        "--metrics-file",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "processed" / "demand_model_metrics.json",
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


def evaluate_regression(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(mean_squared_error(y_true, y_pred) ** 0.5),
    }


def main() -> None:
    args = parse_args()
    df = pd.read_csv(args.dataset_file, parse_dates=["date"])
    train_df = df[df["split"] == "train"].copy()
    valid_df = df[df["split"] == "valid"].copy()
    test_df = df[df["split"] == "test"].copy()

    numeric_features = [
        "lag_1",
        "lag_7",
        "lag_30",
        "ma_7",
        "ma_30",
        "order_freq_7",
        "order_freq_30",
        "order_count",
        "month",
        "quarter",
        "day_of_week",
    ]
    categorical_features = ["supplier_id"]
    feature_cols = numeric_features + categorical_features

    X_train = train_df[feature_cols]
    y_train = train_df["demand_qty"].to_numpy(dtype=float)
    X_valid = valid_df[feature_cols]
    y_valid = valid_df["demand_qty"].to_numpy(dtype=float)
    X_test = test_df[feature_cols]
    y_test = test_df["demand_qty"].to_numpy(dtype=float)

    preprocessor = build_preprocessor(numeric_features, categorical_features)
    lr_model = Pipeline(steps=[("prep", preprocessor), ("reg", LinearRegression())])
    rf_model = Pipeline(
        steps=[
            ("prep", preprocessor),
            ("reg", RandomForestRegressor(n_estimators=300, max_depth=None, min_samples_leaf=2, n_jobs=1, random_state=args.seed)),
        ]
    )

    lr_model.fit(X_train, y_train)
    rf_model.fit(X_train, y_train)

    lr_valid_pred = np.maximum(lr_model.predict(X_valid), 0.0)
    lr_test_pred = np.maximum(lr_model.predict(X_test), 0.0)
    rf_valid_pred = np.maximum(rf_model.predict(X_valid), 0.0)
    rf_test_pred = np.maximum(rf_model.predict(X_test), 0.0)

    metrics = {
        "linear_regression": {
            "valid": evaluate_regression(y_valid, lr_valid_pred),
            "test": evaluate_regression(y_test, lr_test_pred),
        },
        "random_forest_regressor": {
            "valid": evaluate_regression(y_valid, rf_valid_pred),
            "test": evaluate_regression(y_test, rf_test_pred),
        },
        "dataset": {
            "train_rows": int(len(train_df)),
            "valid_rows": int(len(valid_df)),
            "test_rows": int(len(test_df)),
        },
    }

    args.models_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(lr_model, args.models_dir / "demand_linear_regression.joblib")
    joblib.dump(rf_model, args.models_dir / "demand_random_forest.joblib")
    args.metrics_file.parent.mkdir(parents=True, exist_ok=True)
    args.metrics_file.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
