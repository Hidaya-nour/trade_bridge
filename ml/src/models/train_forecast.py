from __future__ import annotations

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.common.io import save_joblib
from src.config import DEMAND_DATASET_PATH, FORECAST_MODEL_PATH
from src.features.build_features import build_demand_dataset


NUMERIC_FEATURES = [
    "revenue",
    "avg_review_score",
    "day_of_week",
    "month",
    "day_of_month",
    "lag_1",
    "lag_7",
    "rolling_mean_7",
    "rolling_mean_14",
]
CATEGORICAL_FEATURES = ["product_id", "seller_id", "product_category_name"]
TARGET_COLUMN = "quantity"


def train_forecast_model(model_path=FORECAST_MODEL_PATH):
    dataset = (
        pd.read_csv(DEMAND_DATASET_PATH, parse_dates=["order_date"])
        if DEMAND_DATASET_PATH.exists()
        else build_demand_dataset()
    )

    dataset = dataset.sort_values("order_date").reset_index(drop=True)
    split_index = int(len(dataset) * 0.8)
    train_frame = dataset.iloc[:split_index]
    test_frame = dataset.iloc[split_index:]

    x_train = train_frame[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y_train = train_frame[TARGET_COLUMN]
    x_test = test_frame[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y_test = test_frame[TARGET_COLUMN]

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
                RandomForestRegressor(
                    n_estimators=300,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    artifact = {
        "model": pipeline,
        "feature_names": NUMERIC_FEATURES + CATEGORICAL_FEATURES,
        "target_column": TARGET_COLUMN,
        "metrics": {
            "mae": float(mean_absolute_error(y_test, predictions)),
            "rmse": float(mean_squared_error(y_test, predictions) ** 0.5),
        },
    }
    save_joblib(artifact, model_path)
    return artifact


if __name__ == "__main__":
    result = train_forecast_model()
    print("saved:", FORECAST_MODEL_PATH)
    print(result["metrics"])
