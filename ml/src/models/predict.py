from __future__ import annotations

from datetime import timedelta
from typing import Any, Dict, List

import pandas as pd

from src.common.io import load_joblib
from src.config import (
    DEMAND_DATASET_PATH,
    FORECAST_MODEL_PATH,
    PREPROCESSED_DATA_PATH,
    RECOMMENDATION_MODEL_PATH,
    SUPPLIER_FEATURES_PATH,
)
from src.features.build_features import build_demand_dataset, build_supplier_features


def recommend_suppliers(
    top_k: int = 5,
    seller_state: str | None = None,
    product_category_name: str | None = None,
) -> List[Dict[str, Any]]:
    supplier_features = (
        pd.read_csv(SUPPLIER_FEATURES_PATH)
        if SUPPLIER_FEATURES_PATH.exists()
        else build_supplier_features()
    )
    artifact = load_joblib(RECOMMENDATION_MODEL_PATH)
    model = artifact["model"]
    feature_names = artifact["feature_names"]

    candidates = supplier_features.copy()
    if seller_state:
        candidates = candidates[candidates["seller_state"] == seller_state]
    if product_category_name and PREPROCESSED_DATA_PATH.exists():
        merged = pd.read_csv(PREPROCESSED_DATA_PATH)
        seller_ids = (
            merged.loc[merged["product_category_name"] == product_category_name, "seller_id"]
            .dropna()
            .unique()
        )
        candidates = candidates[candidates["seller_id"].isin(seller_ids)]

    if candidates.empty:
        return []

    probabilities = model.predict_proba(candidates[feature_names])[:, 1]
    candidates["recommendation_score"] = probabilities
    ranked = candidates.sort_values("recommendation_score", ascending=False).head(top_k)
    return ranked[
        [
            "seller_id",
            "seller_city",
            "seller_state",
            "total_orders",
            "avg_review_score",
            "avg_delivery_days",
            "recommendation_score",
        ]
    ].to_dict("records")


def forecast_demand(
    product_id: str,
    seller_id: str | None = None,
    horizon_days: int = 7,
) -> List[Dict[str, Any]]:
    dataset = (
        pd.read_csv(DEMAND_DATASET_PATH, parse_dates=["order_date"])
        if DEMAND_DATASET_PATH.exists()
        else build_demand_dataset()
    )
    artifact = load_joblib(FORECAST_MODEL_PATH)
    model = artifact["model"]
    feature_names = artifact["feature_names"]

    history = dataset[dataset["product_id"] == product_id].copy()
    if seller_id:
        history = history[history["seller_id"] == seller_id]
    if history.empty:
        return []

    history = history.sort_values("order_date").reset_index(drop=True)
    latest = history.iloc[-1].copy()
    recent_quantities = history["quantity"].tolist()
    forecasts: List[Dict[str, Any]] = []
    last_date = pd.to_datetime(latest["order_date"])

    for step in range(1, horizon_days + 1):
        target_date = last_date + timedelta(days=step)
        lag_1 = recent_quantities[-1] if len(recent_quantities) >= 1 else 0
        lag_7 = recent_quantities[-7] if len(recent_quantities) >= 7 else lag_1
        rolling_mean_7 = sum(recent_quantities[-7:]) / max(1, min(7, len(recent_quantities)))
        rolling_mean_14 = sum(recent_quantities[-14:]) / max(1, min(14, len(recent_quantities)))

        row = {
            "product_id": product_id,
            "seller_id": seller_id or latest["seller_id"],
            "product_category_name": latest["product_category_name"],
            "revenue": float(latest["revenue"]),
            "avg_review_score": float(latest["avg_review_score"]),
            "day_of_week": target_date.dayofweek,
            "month": target_date.month,
            "day_of_month": target_date.day,
            "lag_1": float(lag_1),
            "lag_7": float(lag_7),
            "rolling_mean_7": float(rolling_mean_7),
            "rolling_mean_14": float(rolling_mean_14),
        }
        feature_frame = pd.DataFrame([row])[feature_names]
        prediction = max(0.0, float(model.predict(feature_frame)[0]))
        recent_quantities.append(prediction)
        forecasts.append(
            {
                "date": target_date.strftime("%Y-%m-%d"),
                "forecast_quantity": round(prediction, 2),
            }
        )

    return forecasts
