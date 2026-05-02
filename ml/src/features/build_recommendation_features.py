from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare supplier recommendation classification dataset."
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "raw",  # Fixed: parents[2]
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed" / "recommendation_dataset.csv",  # Fixed: parents[2]
    )
    parser.add_argument(
        "--report-file",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed" / "recommendation_dataset_report.json",  # Fixed: parents[2]
    )
    # ... rest of arguments stay the same

def _clip_outliers(df: pd.DataFrame, col: str) -> pd.DataFrame:
    q1 = df[col].quantile(0.25)
    q3 = df[col].quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    df[col] = df[col].clip(lower=lower, upper=upper)
    return df


def _assign_splits(frame: pd.DataFrame, train_ratio: float, valid_ratio: float) -> pd.Series:
    events = (
        frame[["interaction_id", "order_purchase_timestamp"]]
        .drop_duplicates(subset=["interaction_id"])
        .sort_values(["order_purchase_timestamp", "interaction_id"])
        .reset_index(drop=True)
    )
    n = len(events)
    train_end = int(n * train_ratio)
    valid_end = int(n * (train_ratio + valid_ratio))
    events["split"] = "test"
    events.loc[: train_end - 1, "split"] = "train"
    events.loc[train_end: valid_end - 1, "split"] = "valid"
    return frame.merge(events[["interaction_id", "split"]], on="interaction_id", how="left")["split"]


def _compute_history_features(candidates: pd.DataFrame) -> pd.DataFrame:
    candidates = candidates.sort_values(
        ["order_purchase_timestamp", "interaction_id", "label"], ascending=[True, True, False]
    ).copy()

    event_rows = (
        candidates[["interaction_id", "order_purchase_timestamp", "retailer_id", "product_id"]]
        .drop_duplicates(subset=["interaction_id"])
        .sort_values(["order_purchase_timestamp", "interaction_id"])
        .reset_index(drop=True)
    )

    group_map: Dict[int, pd.DataFrame] = {
        k: g.copy() for k, g in candidates.groupby("interaction_id", sort=False)
    }
    pos_map: Dict[int, str] = (
        candidates[candidates["label"] == 1]
        .drop_duplicates("interaction_id")
        .set_index("interaction_id")["supplier_id"]
        .to_dict()
    )

    supplier_total: Dict[str, int] = {}
    retailer_supplier_total: Dict[tuple[str, str], int] = {}
    retailer_product_total: Dict[tuple[str, str], int] = {}

    enriched: List[pd.DataFrame] = []
    for row in event_rows.itertuples(index=False):
        block = group_map[row.interaction_id]
        hist_supplier = []
        hist_retailer_supplier = []
        hist_retailer_product = []
        for supplier_id in block["supplier_id"].astype(str).tolist():
            hist_supplier.append(supplier_total.get(supplier_id, 0))
            hist_retailer_supplier.append(
                retailer_supplier_total.get((str(row.retailer_id), supplier_id), 0)
            )
            hist_retailer_product.append(
                retailer_product_total.get((str(row.retailer_id), str(row.product_id)), 0)
            )
        block["supplier_global_orders_before"] = hist_supplier
        block["retailer_supplier_orders_before"] = hist_retailer_supplier
        block["retailer_product_orders_before"] = hist_retailer_product
        enriched.append(block)

        chosen_supplier = str(pos_map.get(row.interaction_id, ""))
        if chosen_supplier:
            supplier_total[chosen_supplier] = supplier_total.get(chosen_supplier, 0) + 1
            rs_key = (str(row.retailer_id), chosen_supplier)
            retailer_supplier_total[rs_key] = retailer_supplier_total.get(rs_key, 0) + 1
            rp_key = (str(row.retailer_id), str(row.product_id))
            retailer_product_total[rp_key] = retailer_product_total.get(rp_key, 0) + 1

    return pd.concat(enriched, ignore_index=True)


def _build_interactions(raw_dir: Path) -> pd.DataFrame:
    orders = pd.read_csv(
        raw_dir / "olist_orders_dataset.csv",
        usecols=[
            "order_id",
            "customer_id",
            "order_status",
            "order_purchase_timestamp",
            "order_delivered_customer_date",
        ],
        parse_dates=["order_purchase_timestamp", "order_delivered_customer_date"],
    )
    customers = pd.read_csv(
        raw_dir / "olist_customers_dataset.csv",
        usecols=["customer_id", "customer_unique_id"],
    )
    items = pd.read_csv(
        raw_dir / "olist_order_items_dataset.csv",
        usecols=[
            "order_id",
            "order_item_id",
            "product_id",
            "seller_id",
            "price",
            "freight_value",
        ],
    )
    reviews = pd.read_csv(
        raw_dir / "olist_order_reviews_dataset.csv",
        usecols=["order_id", "review_score"],
    )

    orders = orders[orders["order_status"] == "delivered"].copy()
    orders["delivery_time"] = (
        orders["order_delivered_customer_date"] - orders["order_purchase_timestamp"]
    ).dt.days

    reviews_agg = (
        reviews.groupby("order_id", as_index=False)["review_score"]
        .mean()
        .rename(columns={"review_score": "rating"})
    )

    df = (
        orders.merge(customers, on="customer_id", how="inner")
        .merge(items, on="order_id", how="inner")
        .merge(reviews_agg, on="order_id", how="left")
    )
    df = df.rename(columns={"customer_unique_id": "retailer_id", "seller_id": "supplier_id"})
    df = df.dropna(
        subset=[
            "retailer_id",
            "product_id",
            "supplier_id",
            "price",
            "delivery_time",
            "rating",
            "order_purchase_timestamp",
        ]
    )
    df = df[(df["price"] > 0) & (df["delivery_time"] >= 0)]
    df = df[df["rating"].between(1, 5)]
    df = df.drop_duplicates(subset=["order_id", "order_item_id", "product_id", "supplier_id"])

    interactions = (
        df.groupby(
            [
                "order_id",
                "order_purchase_timestamp",
                "retailer_id",
                "product_id",
                "supplier_id",
                "delivery_time",
                "rating",
            ],
            as_index=False,
        )
        .agg(
            quantity=("order_item_id", "count"),
            unit_price=("price", "mean"),
            total_price=("price", "sum"),
            unit_freight_value=("freight_value", "mean"),
            total_freight_value=("freight_value", "sum"),
        )
        .sort_values("order_purchase_timestamp")
        .reset_index(drop=True)
    )
    interactions["interaction_id"] = interactions.index.astype(int)
    interactions = interactions.rename(columns={"rating": "supplier_avg_rating"})
    return interactions


def _build_candidates(interactions: pd.DataFrame, negatives_per_positive: int, min_product_suppliers: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    suppliers_by_product = interactions.groupby("product_id")["supplier_id"].apply(lambda s: sorted(set(s.tolist()))).to_dict()

    rows: List[dict] = []
    for row in interactions.itertuples(index=False):
        all_suppliers = suppliers_by_product.get(row.product_id, [])
        if len(all_suppliers) < min_product_suppliers:
            continue
        alternatives = [sid for sid in all_suppliers if sid != row.supplier_id]
        if not alternatives:
            continue

        rows.append(
            {
                "interaction_id": row.interaction_id,
                "order_id": row.order_id,
                "order_purchase_timestamp": row.order_purchase_timestamp,
                "retailer_id": row.retailer_id,
                "product_id": row.product_id,
                "supplier_id": row.supplier_id,
                "quantity": row.quantity,
                "delivery_time": row.delivery_time,
                "label": 1,
            }
        )

        n_neg = min(negatives_per_positive, len(alternatives))
        for neg_supplier in rng.choice(alternatives, size=n_neg, replace=False):
            rows.append(
                {
                    "interaction_id": row.interaction_id,
                    "order_id": row.order_id,
                    "order_purchase_timestamp": row.order_purchase_timestamp,
                    "retailer_id": row.retailer_id,
                    "product_id": row.product_id,
                    "supplier_id": neg_supplier,
                    "quantity": row.quantity,
                    "delivery_time": row.delivery_time,
                    "label": 0,
                }
            )
    return pd.DataFrame(rows)


def main() -> None:
    args = parse_args()  # This should work, but apparently returns None
    
    # Add this debug check
    if args is None or not hasattr(args, 'raw_dir'):
        print("No arguments provided, using defaults")
        # Create default args manually
        args = argparse.Namespace()
        args.raw_dir = Path(__file__).resolve().parents[2] / "data" / "raw"
        args.output_file = Path(__file__).resolve().parents[2] / "data" / "processed" / "recommendation_dataset.csv"
        args.report_file = Path(__file__).resolve().parents[2] / "data" / "processed" / "recommendation_dataset_report.json"
        args.train_ratio = 0.70
        args.valid_ratio = 0.15
        args.sla_days = 14
        args.negatives_per_positive = 3
        args.min_product_suppliers = 2
        args.seed = 42
    
    # Rest of your code...

if __name__ == "__main__":
    main()
