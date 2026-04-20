from __future__ import annotations

from pathlib import Path


ML_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ML_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = ML_ROOT / "models"

PREPROCESSED_DATA_PATH = PROCESSED_DATA_DIR / "olist_merged.csv"
SUPPLIER_FEATURES_PATH = PROCESSED_DATA_DIR / "supplier_features.csv"
DEMAND_DATASET_PATH = PROCESSED_DATA_DIR / "demand_dataset.csv"
RECOMMENDATION_MODEL_PATH = MODELS_DIR / "supplier_recommendation_model.pkl"
FORECAST_MODEL_PATH = MODELS_DIR / "demand_forecast_model.pkl"

REQUIRED_OLIST_FILES = {
    "customers": "olist_customers_dataset.csv",
    "orders": "olist_orders_dataset.csv",
    "order_items": "olist_order_items_dataset.csv",
    "reviews": "olist_order_reviews_dataset.csv",
    "products": "olist_products_dataset.csv",
    "sellers": "olist_sellers_dataset.csv",
}
