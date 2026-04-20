from __future__ import annotations

import pandas as pd

from src.common.io import write_csv
from src.config import PREPROCESSED_DATA_PATH
from src.data_processing.load_data import load_olist_data


def preprocess_olist_data(save_path=PREPROCESSED_DATA_PATH) -> pd.DataFrame:
    data = load_olist_data()

    orders = data["orders"].copy()
    order_items = data["order_items"].copy()
    reviews = data["reviews"].copy()
    customers = data["customers"].copy()
    products = data["products"].copy()
    sellers = data["sellers"].copy()

    datetime_columns = [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
        "shipping_limit_date",
        "review_creation_date",
        "review_answer_timestamp",
    ]

    for frame in [orders, order_items, reviews]:
        for column in datetime_columns:
            if column in frame.columns:
                frame[column] = pd.to_datetime(frame[column], errors="coerce")

    reviews = (
        reviews.sort_values("review_answer_timestamp")
        .drop_duplicates(subset=["order_id"], keep="last")
        .copy()
    )

    merged = order_items.merge(
        orders,
        on="order_id",
        how="inner",
        suffixes=("", "_order"),
    )
    merged = merged.merge(customers, on="customer_id", how="left")
    merged = merged.merge(products, on="product_id", how="left")
    merged = merged.merge(sellers, on="seller_id", how="left")
    merged = merged.merge(reviews[["order_id", "review_score"]], on="order_id", how="left")

    merged = merged[
        merged["order_status"].isin(["delivered", "shipped", "invoiced", "processing"])
    ].copy()
    merged["price"] = pd.to_numeric(merged["price"], errors="coerce")
    merged["freight_value"] = pd.to_numeric(merged["freight_value"], errors="coerce")
    merged["review_score"] = pd.to_numeric(merged["review_score"], errors="coerce")

    merged["delivery_days"] = (
        merged["order_delivered_customer_date"] - merged["order_purchase_timestamp"]
    ).dt.days
    merged["estimated_delivery_gap"] = (
        merged["order_estimated_delivery_date"] - merged["order_delivered_customer_date"]
    ).dt.days
    merged["product_category_name"] = merged["product_category_name"].fillna("unknown")
    merged["review_score"] = merged["review_score"].fillna(merged["review_score"].median())
    merged["delivery_days"] = merged["delivery_days"].fillna(merged["delivery_days"].median())
    merged["estimated_delivery_gap"] = merged["estimated_delivery_gap"].fillna(0)

    merged = merged.dropna(
        subset=[
            "seller_id",
            "product_id",
            "customer_unique_id",
            "order_purchase_timestamp",
            "price",
        ]
    ).reset_index(drop=True)

    write_csv(merged, save_path)
    return merged


if __name__ == "__main__":
    frame = preprocess_olist_data()
    print(frame.shape)
