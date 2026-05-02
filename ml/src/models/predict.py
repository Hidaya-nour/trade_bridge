"""Prediction module using advanced trained models with cold-start handling."""

from __future__ import annotations

from datetime import timedelta
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from src.common.io import load_joblib
from src.config import MODELS_DIR, PROCESSED_DATA_DIR, RAW_DATA_DIR


def _rule_score(supplier_row: pd.Series) -> float:
    """Rule-based fallback score for cold-start suppliers."""
    rating = supplier_row.get("supplier_avg_rating", 3.0)
    rating_norm = (rating - 1.0) / 4.0 if not pd.isna(rating) else 0.5
    
    on_time = supplier_row.get("supplier_on_time_rate", 0.5)
    on_time = max(0.0, min(1.0, on_time)) if not pd.isna(on_time) else 0.5
    
    price = supplier_row.get("price_competitiveness", 1.0)
    price_norm = max(0.0, min(1.0, price / 2.0)) if not pd.isna(price) else 0.5
    
    return 0.4 * rating_norm + 0.4 * on_time + 0.2 * price_norm


def recommend_suppliers(
    top_k: int = 5,
    seller_state: str | None = None,
    product_category_name: str | None = None,
) -> List[Dict[str, Any]]:
    """
    Recommend suppliers using Random Forest model.
    
    Args:
        top_k: Number of suppliers to return
        seller_state: Filter by seller state (e.g., "SP", "RJ")
        product_category_name: Filter by product category
    
    Returns:
        List of recommended suppliers with scores
    """
    # Load trained Random Forest model (this is a Pipeline object directly)
    model_path = MODELS_DIR / "supplier_random_forest.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}. Run training first.")
    
    rf_model = load_joblib(model_path)  # This is the Pipeline, not a dict
    
    # Load recommendation dataset
    dataset_path = PROCESSED_DATA_DIR / "recommendation_dataset.csv"
    if not dataset_path.exists():
        raise FileNotFoundError(
            "Recommendation dataset not found. Run: python -m src.features.build_recommendation_features"
        )
    
    df = pd.read_csv(dataset_path, parse_dates=["order_purchase_timestamp"])
    
    # Feature columns used in training (from train_recommendation.py)
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
    
    # Get unique suppliers with their features (take most recent row per supplier)
    suppliers = df.groupby("supplier_id").last().reset_index()
    
    # Ensure all feature columns exist
    for col in feature_cols:
        if col not in suppliers.columns:
            if col in numeric_features:
                suppliers[col] = 0
            else:
                suppliers[col] = "unknown"
    
    # Apply filters
    if seller_state:
        sellers_path = RAW_DATA_DIR / "olist_sellers_dataset.csv"
        if sellers_path.exists():
            sellers = pd.read_csv(sellers_path)
            filtered_ids = sellers[sellers["seller_state"] == seller_state]["seller_id"].tolist()
            suppliers = suppliers[suppliers["supplier_id"].isin(filtered_ids)]
    
    if product_category_name:
        products_path = RAW_DATA_DIR / "olist_products_dataset.csv"
        if products_path.exists():
            products = pd.read_csv(products_path)
            filtered_product_ids = products[products["product_category_name"] == product_category_name]["product_id"].tolist()
            product_suppliers = df[df["product_id"].isin(filtered_product_ids)]["supplier_id"].unique()
            suppliers = suppliers[suppliers["supplier_id"].isin(product_suppliers)]
    
    if suppliers.empty:
        return []
    
    # Prepare features for prediction
    X = suppliers[feature_cols].copy()
    
    # Fill missing values
    for col in numeric_features:
        if col in X.columns:
            X[col] = X[col].fillna(X[col].median() if not X[col].isna().all() else 0)
    
    for col in categorical_features:
        if col in X.columns:
            X[col] = X[col].fillna("unknown").astype(str)
    
    # Get predictions (probability of being a good supplier)
    try:
        ml_scores = rf_model.predict_proba(X)[:, 1]
    except Exception as e:
        print(f"Prediction error: {e}")
        # Fallback to rule-based scoring
        ml_scores = X.apply(_rule_score, axis=1).values
    
    # Rank suppliers
    suppliers["recommendation_score"] = ml_scores
    ranked = suppliers.sort_values("recommendation_score", ascending=False).head(top_k)
    
    # Enrich with supplier details - FIXED: use correct column name 'seller_id'
    sellers_path = RAW_DATA_DIR / "olist_sellers_dataset.csv"
    if sellers_path.exists():
        sellers = pd.read_csv(sellers_path)
        # Note: The sellers table uses 'seller_id', our ranked table uses 'supplier_id'
        result = ranked.merge(sellers, left_on="supplier_id", right_on="seller_id", how="left")
        # Rename columns for consistent output
        if "seller_city" in result.columns:
            result["city"] = result["seller_city"]
        else:
            result["city"] = "unknown"
        if "seller_state" in result.columns:
            result["state"] = result["seller_state"]
        else:
            result["state"] = "unknown"
    else:
        result = ranked.copy()
        result["city"] = "unknown"
        result["state"] = "unknown"
    
    # Return clean results
    return result[["supplier_id", "city", "state", "recommendation_score"]].rename(
        columns={"supplier_id": "seller_id"}
    ).to_dict("records")

def forecast_demand(
    product_id: str,
    seller_id: str | None = None,
    horizon_days: int = 7,
) -> List[Dict[str, Any]]:
    """
    Forecast demand using Random Forest model.
    
    Args:
        product_id: Product ID to forecast (supplier_id in demand dataset)
        seller_id: Optional seller filter
        horizon_days: Number of days to forecast
    
    Returns:
        List of daily forecasts with dates and quantities
    """
    # Load trained Random Forest model (this is a Pipeline object directly)
    model_path = MODELS_DIR / "demand_random_forest.joblib"
    if not model_path.exists():
        # Try linear regression as fallback
        model_path = MODELS_DIR / "demand_linear_regression.joblib"
        if not model_path.exists():
            raise FileNotFoundError(
                f"No demand model found. Run: python -m src.models.train_forecast"
            )
    
    model = load_joblib(model_path)  # This is the Pipeline, not a dict
    
    # Load demand dataset
    dataset_path = PROCESSED_DATA_DIR / "demand_dataset.csv"
    if not dataset_path.exists():
        raise FileNotFoundError(
            "Demand dataset not found. Run: python -m src.features.build_demand_features"
        )
    
    dataset = pd.read_csv(dataset_path, parse_dates=["date"])
    
    # Filter for product/supplier (in demand dataset, supplier_id is the key)
    history = dataset[dataset["supplier_id"] == product_id].copy()
    if seller_id:
        history = history[history["supplier_id"] == seller_id]
    
    if history.empty:
        return []
    
    # Sort and prepare for forecasting
    history = history.sort_values("date").reset_index(drop=True)
    
    # Define feature columns (excluding target and metadata)
exclude_cols = ["supplier_id", "date", "demand_qty", "split"]
    feature_cols = [col for col in history.columns if col not in exclude_cols]
    
    forecasts = []
    last_row = history.iloc[-1].copy()
    last_date = last_row["date"]
    
    # Store recent demand values for rolling features
    recent_demand = history["demand_qty"].tolist()
    recent_orders = history["order_count"].tolist()
    
    for step in range(1, horizon_days + 1):
        forecast_date = last_date + timedelta(days=step)
        
        # Create new row with updated features
        new_row = last_row.copy()
        new_row["date"] = forecast_date
        new_row["month"] = forecast_date.month
        new_row["quarter"] = (forecast_date.month - 1) // 3 + 1
        new_row["day_of_week"] = forecast_date.dayofweek
        
        # Update lag features
        new_row["lag_1"] = recent_demand[-1] if len(recent_demand) >= 1 else 0
        new_row["lag_7"] = recent_demand[-7] if len(recent_demand) >= 7 else recent_demand[-1] if recent_demand else 0
        new_row["lag_30"] = recent_demand[-30] if len(recent_demand) >= 30 else recent_demand[-1] if recent_demand else 0
        
        # Update moving averages
        if len(recent_demand) >= 7:
            new_row["ma_7"] = np.mean(recent_demand[-7:])
        else:
            new_row["ma_7"] = np.mean(recent_demand) if recent_demand else 0
            
        if len(recent_demand) >= 30:
            new_row["ma_30"] = np.mean(recent_demand[-30:])
        else:
            new_row["ma_30"] = np.mean(recent_demand) if recent_demand else 0
        
        # Update order frequency features
        if len(recent_orders) >= 7:
            new_row["order_freq_7"] = np.sum(recent_orders[-7:])
        else:
            new_row["order_freq_7"] = np.sum(recent_orders) if recent_orders else 0
            
        if len(recent_orders) >= 30:
            new_row["order_freq_30"] = np.sum(recent_orders[-30:])
        else:
            new_row["order_freq_30"] = np.sum(recent_orders) if recent_orders else 0
        
        # Prepare feature vector - ensure all feature columns exist
        X = pd.DataFrame([new_row[feature_cols].values], columns=feature_cols)
        
        # Predict
        try:
            prediction = max(0.0, float(model.predict(X)[0]))
        except Exception as e:
            print(f"Prediction error: {e}")
            # Fallback: use recent average
            prediction = np.mean(recent_demand[-7:]) if len(recent_demand) >= 7 else np.mean(recent_demand) if recent_demand else 0
        
        forecasts.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "forecast_quantity": round(prediction, 2)
        })
        
        # Update recent values for next iteration
        recent_demand.append(prediction)
        recent_orders.append(new_row["order_count"])
    
    return forecasts