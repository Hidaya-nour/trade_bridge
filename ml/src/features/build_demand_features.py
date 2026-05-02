from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List

import pandas as pd


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare demand forecasting dataset with lag and seasonality features."
    )
    parser.add_argument(
        "--interactions-file",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed" / "recommendation_dataset.csv",  # Fixed: parents[2]
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed" / "demand_dataset.csv",  # Fixed: parents[2]
    )
    parser.add_argument(
        "--report-file",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed" / "demand_dataset_report.json",  # Fixed: parents[2]
    )
    parser.add_argument("--train-ratio", type=float, default=0.70)
    parser.add_argument("--valid-ratio", type=float, default=0.15)
    return parser.parse_args()

def build_supplier_daily_frame(interactions: pd.DataFrame) -> pd.DataFrame:
    interactions = interactions.copy()
    interactions["date"] = interactions["order_purchase_timestamp"].dt.floor("D")
    daily = (
        interactions.groupby(["supplier_id", "date"], as_index=False)
        .agg(
            demand_qty=("quantity", "sum"),
            order_count=("order_id", "nunique"),
        )
        .sort_values(["supplier_id", "date"])
    )

    frames: List[pd.DataFrame] = []
    for supplier_id, group in daily.groupby("supplier_id", sort=False):
        full_dates = pd.date_range(group["date"].min(), group["date"].max(), freq="D")
        expanded = pd.DataFrame({"date": full_dates})
        expanded["supplier_id"] = supplier_id
        expanded = expanded.merge(group, on=["supplier_id", "date"], how="left")
        expanded["demand_qty"] = expanded["demand_qty"].fillna(0)
        expanded["order_count"] = expanded["order_count"].fillna(0)
        frames.append(expanded)
    return pd.concat(frames, ignore_index=True)


def add_features(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.sort_values(["supplier_id", "date"]).copy()
    g = frame.groupby("supplier_id", sort=False)
    frame["lag_1"] = g["demand_qty"].shift(1)
    frame["lag_7"] = g["demand_qty"].shift(7)
    frame["lag_30"] = g["demand_qty"].shift(30)
    frame["ma_7"] = g["demand_qty"].shift(1).rolling(7).mean()
    frame["ma_30"] = g["demand_qty"].shift(1).rolling(30).mean()
    frame["order_freq_7"] = g["order_count"].shift(1).rolling(7).sum()
    frame["order_freq_30"] = g["order_count"].shift(1).rolling(30).sum()
    frame["month"] = frame["date"].dt.month
    frame["quarter"] = frame["date"].dt.quarter
    frame["day_of_week"] = frame["date"].dt.dayofweek
    frame = frame.dropna(
        subset=["lag_1", "lag_7", "lag_30", "ma_7", "ma_30", "order_freq_7", "order_freq_30"]
    )
    return frame


def assign_splits(frame: pd.DataFrame, train_ratio: float, valid_ratio: float) -> pd.DataFrame:
    unique_dates = sorted(frame["date"].unique().tolist())
    n = len(unique_dates)
    train_end = int(n * train_ratio)
    valid_end = int(n * (train_ratio + valid_ratio))
    date_to_split = {}
    for i, dt in enumerate(unique_dates):
        if i < train_end:
            date_to_split[dt] = "train"
        elif i < valid_end:
            date_to_split[dt] = "valid"
        else:
            date_to_split[dt] = "test"
    frame["split"] = frame["date"].map(date_to_split)
    return frame


def main() -> None:
    args = parse_args()
    interactions = pd.read_csv(args.interactions_file, parse_dates=["order_purchase_timestamp"])
    required_cols = {"order_id", "supplier_id", "quantity", "order_purchase_timestamp"}
    missing = required_cols - set(interactions.columns)
    if missing:
        raise ValueError(f"Missing required columns in interactions file: {sorted(missing)}")

    daily = build_supplier_daily_frame(interactions)
    dataset = add_features(daily)
    dataset = assign_splits(dataset, args.train_ratio, args.valid_ratio)
    dataset = dataset.sort_values(["date", "supplier_id"])

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(args.output_file, index=False)

    report = {
        "rows": int(len(dataset)),
        "unique_suppliers": int(dataset["supplier_id"].nunique()),
        "date_min": str(dataset["date"].min()),
        "date_max": str(dataset["date"].max()),
        "split_rows": dataset["split"].value_counts().to_dict(),
        "target_mean": float(dataset["demand_qty"].mean()),
        "target_median": float(dataset["demand_qty"].median()),
    }
    args.report_file.parent.mkdir(parents=True, exist_ok=True)
    args.report_file.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
