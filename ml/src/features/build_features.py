from __future__ import annotations

from typing import Tuple

import pandas as pd

from src.common.io import write_csv
from src.config import DEMAND_DATASET_PATH, PREPROCESSED_DATA_PATH, SUPPLIER_FEATURES_PATH
from src.data_processing.preprocess import preprocess_olist_data


def _load_preprocessed() -> pd.DataFrame:
    if PREPROCESSED_DATA_PATH.exists():
        return pd.read_csv(PREPROCESSED_DATA_PATH, parse_dates=["order_purchase_timestamp"])
    return preprocess_olist_data()


def build_supplier_features(save_path=SUPPLIER_FEATURES_PATH) -> pd.DataFrame:
    frame = _load_preprocessed().copy()

    supplier = (
        frame.groupby("seller_id", as_index=False)
        .agg(
            seller_zip_code_prefix=("seller_zip_code_prefix", "first"),
            seller_city=("seller_city", "first"),
            seller_state=("seller_state", "first"),
            total_orders=("order_id", "nunique"),
            total_items=("order_item_id", "count"),
            total_products=("product_id", "nunique"),
            total_revenue=("price", "sum"),
            avg_price=("price", "mean"),
            avg_freight_value=("freight_value", "mean"),
            avg_review_score=("review_score", "mean"),
            avg_delivery_days=("delivery_days", "mean"),
            avg_estimated_delivery_gap=("estimated_delivery_gap", "mean"),
            total_customers=("customer_unique_id", "nunique"),
            total_categories=("product_category_name", "nunique"),
        )
    )

    supplier["revenue_per_order"] = supplier["total_revenue"] / supplier["total_orders"].clip(lower=1)
    supplier["items_per_order"] = supplier["total_items"] / supplier["total_orders"].clip(lower=1)
    supplier["customer_retention_proxy"] = supplier["total_orders"] / supplier["total_customers"].clip(lower=1)
    supplier["delivery_reliability"] = 1 / (1 + supplier["avg_delivery_days"].clip(lower=0))
    supplier["label"] = (
        (
            supplier["avg_review_score"].rank(pct=True) * 0.45
            + supplier["total_orders"].rank(pct=True) * 0.30
            + supplier["delivery_reliability"].rank(pct=True) * 0.25
        )
        >= 0.60
    ).astype(int)

    write_csv(supplier, save_path)
    return supplier


def build_demand_dataset(save_path=DEMAND_DATASET_PATH) -> pd.DataFrame:
    frame = _load_preprocessed().copy()
    frame["order_purchase_timestamp"] = pd.to_datetime(
        frame["order_purchase_timestamp"], errors="coerce"
    )
    frame["order_date"] = frame["order_purchase_timestamp"].dt.floor("D")

    daily = (
        frame.groupby(
            ["product_id", "seller_id", "product_category_name", "order_date"],
            as_index=False,
        )
        .agg(
            quantity=("order_item_id", "count"),
            revenue=("price", "sum"),
            avg_review_score=("review_score", "mean"),
        )
        .sort_values(["product_id", "order_date"])
        .reset_index(drop=True)
    )

    daily["day_of_week"] = daily["order_date"].dt.dayofweek
    daily["month"] = daily["order_date"].dt.month
    daily["day_of_month"] = daily["order_date"].dt.day
    daily["lag_1"] = daily.groupby("product_id")["quantity"].shift(1)
    daily["lag_7"] = daily.groupby("product_id")["quantity"].shift(7)
    daily["rolling_mean_7"] = (
        daily.groupby("product_id")["quantity"].shift(1).rolling(7).mean()
    )
    daily["rolling_mean_14"] = (
        daily.groupby("product_id")["quantity"].shift(1).rolling(14).mean()
    )

    daily = daily.dropna().reset_index(drop=True)
    write_csv(daily, save_path)
    return daily


def build_all_features() -> Tuple[pd.DataFrame, pd.DataFrame]:
    return build_supplier_features(), build_demand_dataset()


if __name__ == "__main__":
    supplier_frame, demand_frame = build_all_features()
    print("supplier_features:", supplier_frame.shape)
    print("demand_dataset:", demand_frame.shape)
