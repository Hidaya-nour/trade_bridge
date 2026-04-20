from __future__ import annotations

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.common.io import save_joblib
from src.config import RECOMMENDATION_MODEL_PATH, SUPPLIER_FEATURES_PATH
from src.features.build_features import build_supplier_features


NUMERIC_FEATURES = [
    "total_orders",
    "total_items",
    "total_products",
    "total_revenue",
    "avg_price",
    "avg_freight_value",
    "avg_review_score",
    "avg_delivery_days",
    "avg_estimated_delivery_gap",
    "total_customers",
    "total_categories",
    "revenue_per_order",
    "items_per_order",
    "customer_retention_proxy",
    "delivery_reliability",
]
CATEGORICAL_FEATURES = ["seller_state", "seller_city"]


def train_recommendation_model(model_path=RECOMMENDATION_MODEL_PATH):
    dataset = (
        pd.read_csv(SUPPLIER_FEATURES_PATH)
        if SUPPLIER_FEATURES_PATH.exists()
        else build_supplier_features()
    )

    x = dataset[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = dataset["label"]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
                NUMERIC_FEATURES,
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                CATEGORICAL_FEATURES,
            ),
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=300,
                    random_state=42,
                    n_jobs=-1,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    artifact = {
        "model": pipeline,
        "feature_names": NUMERIC_FEATURES + CATEGORICAL_FEATURES,
        "label_column": "label",
        "report": classification_report(y_test, predictions, output_dict=True),
    }
    save_joblib(artifact, model_path)
    return artifact


if __name__ == "__main__":
    result = train_recommendation_model()
    print("saved:", RECOMMENDATION_MODEL_PATH)
    print(result["report"])
