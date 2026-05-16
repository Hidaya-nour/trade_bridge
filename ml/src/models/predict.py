"""Prediction module using advanced trained models with cold-start handling."""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd

from src.common.io import load_joblib
from src.config import MODELS_DIR, PROCESSED_DATA_DIR, RAW_DATA_DIR


APP_SNAPSHOT_PATH = PROCESSED_DATA_DIR / "tradebridge_snapshot.json"

CATEGORY_ALIASES = {
    "food": "alimentos",
    "grocery": "alimentos",
    "groceries": "alimentos",
    "beverage": "bebidas",
    "beverages": "bebidas",
    "drink": "bebidas",
    "drinks": "bebidas",
    "cleaning": "utilidades_domesticas",
    "household": "utilidades_domesticas",
    "health": "beleza_saude",
    "beauty": "beleza_saude",
    "personal care": "beleza_saude",
    "electronics": "informatica_acessorios",
    "phone": "telefonia",
    "fashion": "fashion_bolsas_e_acessorios",
    "clothing": "fashion_roupa_masculina",
    "furniture": "moveis_decoracao",
    "stationery": "papelaria",
}


def _as_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or pd.isna(value):
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _as_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or pd.isna(value):
            return default
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _norm(value: Any) -> str:
    return str(value or "").strip().lower()


def _read_json(path: Path) -> Dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        import json

        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"Unable to read TradeBridge ML snapshot {path}: {exc}")
        return None


def _category_matches(left: Any, right: Any) -> bool:
    if not left or not right:
        return False
    left_norm = _norm(left)
    right_norm = _norm(right)
    return (
        left_norm == right_norm
        or left_norm in right_norm
        or right_norm in left_norm
        or CATEGORY_ALIASES.get(left_norm) == CATEGORY_ALIASES.get(right_norm)
    )


def _olist_category(category: Any) -> str | None:
    if not category:
        return None
    category_norm = _norm(category)
    return CATEGORY_ALIASES.get(category_norm) or category_norm.replace(" ", "_")


def _build_olist_context(df: pd.DataFrame) -> Dict[str, Any]:
    positives = df[df["label"].astype(int) == 1].copy() if "label" in df.columns else df.copy()
    top_suppliers = (
        positives.groupby("supplier_id")
        .agg(
            supplier_total_orders=("order_id", "nunique"),
            supplier_avg_rating=("supplier_avg_rating", "mean"),
            supplier_on_time_rate=("supplier_on_time_rate", "mean"),
        )
        .sort_values(["supplier_total_orders", "supplier_avg_rating", "supplier_on_time_rate"], ascending=False)
        .reset_index()
    )
    top_retailers = (
        positives.groupby("retailer_id")["order_id"]
        .nunique()
        .sort_values(ascending=False)
        .index.astype(str)
        .tolist()
    )

    products_by_category: Dict[str, str] = {}
    products_path = RAW_DATA_DIR / "olist_products_dataset.csv"
    if products_path.exists():
        products = pd.read_csv(products_path, usecols=["product_id", "product_category_name"])
        products = products.dropna(subset=["product_id", "product_category_name"])
        known_products = set(df["product_id"].astype(str).unique().tolist())
        products = products[products["product_id"].astype(str).isin(known_products)]
        for row in products.itertuples(index=False):
            products_by_category.setdefault(str(row.product_category_name), str(row.product_id))

    fallback_product = str(positives["product_id"].mode().iloc[0]) if not positives.empty else "unknown"
    return {
        "top_supplier_ids": top_suppliers["supplier_id"].astype(str).tolist(),
        "top_retailer_ids": top_retailers,
        "products_by_category": products_by_category,
        "fallback_product_id": fallback_product,
    }


def _snapshot_items(snapshot: Dict[str, Any], key: str) -> List[Dict[str, Any]]:
    value = snapshot.get(key, [])
    return value if isinstance(value, list) else []


def _app_retailer_profile(snapshot: Dict[str, Any], retailer_id: str | None) -> Dict[str, Any]:
    orders = _snapshot_items(snapshot, "orders")
    if not retailer_id:
        return {"category_counts": {}, "avg_price": None, "supplier_counts": {}}

    category_counts: Dict[str, int] = {}
    supplier_counts: Dict[str, int] = {}
    prices: List[float] = []
    for order in orders:
        if str(order.get("buyer_id")) != str(retailer_id):
            continue
        supplier_id = str(order.get("supplier_id") or "")
        if supplier_id:
            supplier_counts[supplier_id] = supplier_counts.get(supplier_id, 0) + 1
        for item in order.get("items", []) or []:
            category = _norm(item.get("category"))
            if category:
                category_counts[category] = category_counts.get(category, 0) + _as_int(item.get("quantity"), 1)
            price = _as_float(item.get("unit_price"), 0)
            if price > 0:
                prices.append(price)

    return {
        "category_counts": category_counts,
        "avg_price": float(np.mean(prices)) if prices else None,
        "supplier_counts": supplier_counts,
    }


def _select_requested_product(snapshot: Dict[str, Any], product_id: str | None) -> Dict[str, Any] | None:
    if not product_id:
        return None
    for product in _snapshot_items(snapshot, "products"):
        if str(product.get("id")) == str(product_id):
            return product
    return None


def _app_candidate_rows(
    snapshot: Dict[str, Any],
    retailer_id: str | None,
    product_id: str | None,
    product_category_name: str | None,
    olist_context: Dict[str, Any],
) -> Tuple[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]]:
    users = _snapshot_items(snapshot, "users") or _snapshot_items(snapshot, "distributors")
    products = _snapshot_items(snapshot, "products")
    orders = _snapshot_items(snapshot, "orders")

    distributors = [
        user
        for user in users
        if _norm(user.get("role")) == "distributor" and _norm(user.get("status") or "active") == "active"
    ]
    distributor_ids = {str(user.get("id")) for user in distributors}
    products_by_supplier: Dict[str, List[Dict[str, Any]]] = {}
    for product in products:
        supplier_id = str(product.get("supplier_id") or "")
        if supplier_id in distributor_ids and product.get("is_available", True):
            products_by_supplier.setdefault(supplier_id, []).append(product)

    requested_product = _select_requested_product(snapshot, product_id)
    requested_category = (
        product_category_name
        or (requested_product or {}).get("category")
        or None
    )
    if not requested_category:
        profile = _app_retailer_profile(snapshot, retailer_id)
        if profile["category_counts"]:
            requested_category = max(profile["category_counts"], key=profile["category_counts"].get)
    else:
        profile = _app_retailer_profile(snapshot, retailer_id)

    if requested_product:
        candidate_ids = [
            sid
            for sid, supplier_products in products_by_supplier.items()
            if any(_category_matches(product.get("category"), requested_product.get("category")) for product in supplier_products)
        ]
    elif requested_category:
        candidate_ids = [
            sid
            for sid, supplier_products in products_by_supplier.items()
            if any(_category_matches(product.get("category"), requested_category) for product in supplier_products)
        ]
    else:
        candidate_ids = list(products_by_supplier.keys())

    if not candidate_ids:
        candidate_ids = list(products_by_supplier.keys())

    completed_statuses = {"delivered", "closed", "completed"}
    order_count_by_supplier: Dict[str, int] = {}
    retailer_supplier_counts: Dict[str, int] = {}
    supplier_order_totals: Dict[str, float] = {}
    for order in orders:
        supplier_id = str(order.get("supplier_id") or "")
        if supplier_id not in distributor_ids:
            continue
        if _norm(order.get("order_status")) in completed_statuses:
            order_count_by_supplier[supplier_id] = order_count_by_supplier.get(supplier_id, 0) + 1
            supplier_order_totals[supplier_id] = supplier_order_totals.get(supplier_id, 0.0) + _as_float(order.get("total_price"), 0)
            if retailer_id and str(order.get("buyer_id")) == str(retailer_id):
                retailer_supplier_counts[supplier_id] = retailer_supplier_counts.get(supplier_id, 0) + 1

    all_prices = [
        _as_float(product.get("price"), 0)
        for product_list in products_by_supplier.values()
        for product in product_list
        if _as_float(product.get("price"), 0) > 0
    ]
    global_median_price = float(np.median(all_prices)) if all_prices else 1.0

    olist_supplier_ids = olist_context["top_supplier_ids"] or ["unknown"]
    requested_olist_category = _olist_category(requested_category)
    model_product_id = olist_context["products_by_category"].get(
        requested_olist_category,
        olist_context["fallback_product_id"],
    )
    model_retailer_ids = olist_context["top_retailer_ids"] or ["unknown"]
    profile_strength = sum(profile["category_counts"].values())
    model_retailer_id = model_retailer_ids[profile_strength % len(model_retailer_ids)]

    rows: List[Dict[str, Any]] = []
    metadata: List[Dict[str, Any]] = []
    for index, distributor in enumerate(distributors):
        supplier_id = str(distributor.get("id"))
        if supplier_id not in candidate_ids:
            continue
        supplier_products = products_by_supplier.get(supplier_id, [])
        if not supplier_products:
            continue

        matching_products = [
            product
            for product in supplier_products
            if not requested_category or _category_matches(product.get("category"), requested_category)
        ] or supplier_products

        product_prices = [_as_float(product.get("price"), 0) for product in matching_products if _as_float(product.get("price"), 0) > 0]
        avg_price = float(np.mean(product_prices)) if product_prices else global_median_price
        product_median = float(np.median(product_prices)) if product_prices else global_median_price
        ratings = [_as_float(product.get("rating"), 0) for product in supplier_products if _as_float(product.get("rating"), 0) > 0]
        avg_rating = float(np.mean(ratings)) if ratings else 3.5
        supplier_total_orders = order_count_by_supplier.get(supplier_id, 0)
        retailer_supplier_orders = retailer_supplier_counts.get(supplier_id, 0)
        category_affinity = 0.0
        if requested_category:
            category_affinity = profile["category_counts"].get(_norm(requested_category), 0) / max(profile_strength, 1)
        prior_supplier_affinity = min(retailer_supplier_orders / 5.0, 1.0)
        stock_qty = sum(_as_int(product.get("stock_quantity"), 0) for product in matching_products)

        rows.append(
            {
                "actual_supplier_id": supplier_id,
                "retailer_id": model_retailer_id,
                "product_id": model_product_id,
                "supplier_id": olist_supplier_ids[index % len(olist_supplier_ids)],
                "price_competitiveness": max(0.0, min(2.0, product_median / max(avg_price, 0.01))),
                "supplier_on_time_rate": 0.85 if supplier_total_orders == 0 else 0.65 + min(supplier_total_orders, 20) / 100,
                "supplier_avg_rating": avg_rating,
                "supplier_avg_fulfillment_days": 4.0 if supplier_total_orders else 6.0,
                "communication_responsiveness_score": 0.75 + min(supplier_total_orders, 10) / 100,
                "supplier_total_orders": supplier_total_orders,
                "supplier_global_orders_before": supplier_total_orders,
                "retailer_supplier_orders_before": retailer_supplier_orders,
                "retailer_product_orders_before": int(profile["category_counts"].get(_norm(requested_category), 0)) if requested_category else 0,
            }
        )
        metadata.append(
            {
                "id": supplier_id,
                "name": distributor.get("business_name") or distributor.get("full_name") or "Distributor",
                "city": distributor.get("city") or distributor.get("pickup_location") or "unknown",
                "state": "TradeBridge",
                "category_affinity": category_affinity,
                "prior_supplier_affinity": prior_supplier_affinity,
                "stock_score": min(stock_qty / 100.0, 1.0),
                "product_count": len(matching_products),
            }
        )

    return pd.DataFrame(rows), metadata, {
        "requested_category": requested_category,
        "requested_product_found": requested_product is not None,
        "distributors_before_filters": len([sid for sid in products_by_supplier.keys()]),
    }


def _recommend_tradebridge_distributors(
    rf_model: Any,
    df: pd.DataFrame,
    top_k: int,
    retailer_id: str | None,
    product_id: str | None,
    seller_state: str | None,
    product_category_name: str | None,
    feature_cols: List[str],
    numeric_features: List[str],
    categorical_features: List[str],
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]] | None:
    if seller_state:
        return None

    snapshot = _read_json(APP_SNAPSHOT_PATH)
    if not snapshot:
        return None

    candidates, metadata, app_meta = _app_candidate_rows(
        snapshot=snapshot,
        retailer_id=retailer_id,
        product_id=product_id,
        product_category_name=product_category_name,
        olist_context=_build_olist_context(df),
    )
    if candidates.empty:
        return [], {
            "personalization": {"retailer_id": retailer_id is not None, "product_id": product_id is not None},
            "filters": {"seller_state": False, "product_category_name": product_category_name is not None},
            "candidates": {"before_filters": app_meta["distributors_before_filters"], "after_filters": 0},
            "scoring": {"strategy": "tradebridge_snapshot_empty", "cold_start_rows": 0, "ml_rows": 0},
            "source": "tradebridge_snapshot",
        }

    X = candidates[feature_cols].copy()
    for col in numeric_features:
        X[col] = X[col].fillna(X[col].median() if not X[col].isna().all() else 0)
    for col in categorical_features:
        X[col] = X[col].fillna("unknown").astype(str)

    try:
        model_scores = rf_model.predict_proba(X)[:, 1]
        strategy = "ml_bridge"
    except Exception as exc:
        print(f"TradeBridge bridge prediction error: {exc}")
        model_scores = X.apply(_rule_score, axis=1).values
        strategy = "rules"

    personalization_scores = np.array(
        [
            0.5 * row["category_affinity"] + 0.3 * row["prior_supplier_affinity"] + 0.2 * row["stock_score"]
            for row in metadata
        ],
        dtype=float,
    )
    final_scores = 0.78 * model_scores + 0.22 * personalization_scores
    ranked_idx = np.argsort(final_scores)[::-1][:top_k]

    recommendations = []
    for idx in ranked_idx:
        info = metadata[int(idx)]
        recommendations.append(
            {
                "seller_id": info["id"],
                "name": info["name"],
                "city": info["city"],
                "state": info["state"],
                "recommendation_score": round(float(final_scores[int(idx)]), 4),
                "product_count": info["product_count"],
            }
        )

    meta = {
        "personalization": {"retailer_id": retailer_id is not None, "product_id": product_id is not None},
        "filters": {"seller_state": False, "product_category_name": product_category_name is not None},
        "candidates": {"before_filters": app_meta["distributors_before_filters"], "after_filters": int(len(candidates))},
        "scoring": {
            "strategy": strategy,
            "cold_start_rows": 0,
            "ml_rows": int(len(candidates)) if strategy == "ml_bridge" else 0,
        },
        "source": "tradebridge_snapshot",
        "bridge": {
            "requested_category": app_meta["requested_category"],
            "requested_product_found": app_meta["requested_product_found"],
        },
    }
    return recommendations, meta


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
    retailer_id: str | None = None,
    product_id: str | None = None,
    seller_state: str | None = None,
    product_category_name: str | None = None,
) -> List[Dict[str, Any]]:
    """
    Recommend suppliers using Random Forest model.
    
    Args:
        top_k: Number of suppliers to return
        retailer_id: Retailer/customer id to personalize recommendations
        product_id: Product id to personalize recommendations
        seller_state: Filter by seller state (e.g., "SP", "RJ")
        product_category_name: Filter by product category
    
    Returns:
        List of recommended suppliers with scores
    """
    recommendations, _meta = recommend_suppliers_with_meta(
        top_k=top_k,
        retailer_id=retailer_id,
        product_id=product_id,
        seller_state=seller_state,
        product_category_name=product_category_name,
    )
    return recommendations


def recommend_suppliers_with_meta(
    top_k: int = 5,
    retailer_id: str | None = None,
    product_id: str | None = None,
    seller_state: str | None = None,
    product_category_name: str | None = None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
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
    train_df = df[df["split"] == "train"].copy() if "split" in df.columns else df

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

    tradebridge_result = _recommend_tradebridge_distributors(
        rf_model=rf_model,
        df=df,
        top_k=top_k,
        retailer_id=retailer_id,
        product_id=product_id,
        seller_state=seller_state,
        product_category_name=product_category_name,
        feature_cols=feature_cols,
        numeric_features=numeric_features,
        categorical_features=categorical_features,
    )
    if tradebridge_result is not None:
        return tradebridge_result

    # Base table: unique suppliers with their most recent known features.
    suppliers = (
        df.sort_values("order_purchase_timestamp")
        .groupby("supplier_id")
        .tail(1)
        .reset_index(drop=True)
    )
    candidates_before_filters = int(len(suppliers))

    # Ensure all feature columns exist
    for col in feature_cols:
        if col not in suppliers.columns:
            if col in numeric_features:
                suppliers[col] = 0
            else:
                suppliers[col] = "unknown"

    # If a retailer/product context is provided, score suppliers in that context.
    # Without this, every retailer will tend to get the same global ranking.
    candidates = suppliers.copy()
    if retailer_id is not None:
        candidates["retailer_id"] = str(retailer_id)
        # Retailer-supplier history: take the latest known "orders_before" value per supplier for this retailer.
        retailer_slice = df[df["retailer_id"].astype(str) == str(retailer_id)].copy()
        if not retailer_slice.empty and "retailer_supplier_orders_before" in retailer_slice.columns:
            rs_latest = (
                retailer_slice.sort_values("order_purchase_timestamp")
                .groupby("supplier_id", as_index=False)["retailer_supplier_orders_before"]
                .max()
            )
            candidates = candidates.merge(rs_latest, on="supplier_id", how="left", suffixes=("", "_retailer"))
            if "retailer_supplier_orders_before_retailer" in candidates.columns:
                candidates["retailer_supplier_orders_before"] = candidates["retailer_supplier_orders_before_retailer"].fillna(0)
                candidates = candidates.drop(columns=["retailer_supplier_orders_before_retailer"])
        else:
            candidates["retailer_supplier_orders_before"] = 0

    if product_id is not None:
        candidates["product_id"] = str(product_id)
        # Filter suppliers that have ever sold this product (if available in dataset).
        product_suppliers = (
            df[df["product_id"].astype(str) == str(product_id)]["supplier_id"]
            .astype(str)
            .unique()
        )
        if len(product_suppliers) > 0:
            candidates = candidates[candidates["supplier_id"].astype(str).isin(product_suppliers)]

    # Retailer-product history depends on both retailer and product; approximate using latest known value for the pair.
    if retailer_id is not None and product_id is not None:
        rp_slice = df[
            (df["retailer_id"].astype(str) == str(retailer_id))
            & (df["product_id"].astype(str) == str(product_id))
        ]
        if not rp_slice.empty and "retailer_product_orders_before" in rp_slice.columns:
            candidates["retailer_product_orders_before"] = float(rp_slice["retailer_product_orders_before"].max())
        else:
            candidates["retailer_product_orders_before"] = 0
    elif retailer_id is not None or product_id is not None:
        # If only one side of the pair is provided, we cannot compute the pair history reliably.
        candidates["retailer_product_orders_before"] = 0

    # Apply filters
    if seller_state:
        sellers_path = RAW_DATA_DIR / "olist_sellers_dataset.csv"
        if sellers_path.exists():
            sellers = pd.read_csv(sellers_path)
            filtered_ids = sellers[sellers["seller_state"] == seller_state]["seller_id"].tolist()
            candidates = candidates[candidates["supplier_id"].isin(filtered_ids)]

    if product_category_name:
        products_path = RAW_DATA_DIR / "olist_products_dataset.csv"
        if products_path.exists():
            products = pd.read_csv(products_path)
            filtered_product_ids = products[products["product_category_name"] == product_category_name]["product_id"].tolist()
            product_suppliers = df[df["product_id"].isin(filtered_product_ids)]["supplier_id"].unique()
            candidates = candidates[candidates["supplier_id"].isin(product_suppliers)]

    if candidates.empty:
        return [], {
            "personalization": {"retailer_id": retailer_id is not None, "product_id": product_id is not None},
            "filters": {"seller_state": seller_state is not None, "product_category_name": product_category_name is not None},
            "candidates": {"before_filters": candidates_before_filters, "after_filters": 0},
            "scoring": {"strategy": "none", "cold_start_rows": 0, "ml_rows": 0},
        }

    # Prepare features for prediction
    X = candidates[feature_cols].copy()

    # Fill missing values
    for col in numeric_features:
        if col in X.columns:
            X[col] = X[col].fillna(X[col].median() if not X[col].isna().all() else 0)

    for col in categorical_features:
        if col in X.columns:
            X[col] = X[col].fillna("unknown").astype(str)

    # Compute a cold-start mask (unseen retailers/suppliers vs training split).
    seen_retailers = set(train_df["retailer_id"].astype(str).unique().tolist()) if "retailer_id" in train_df.columns else set()
    seen_suppliers = set(train_df["supplier_id"].astype(str).unique().tolist()) if "supplier_id" in train_df.columns else set()
    cold_mask = np.zeros(len(X), dtype=bool)
    if retailer_id is not None and seen_retailers:
        cold_mask |= ~X["retailer_id"].astype(str).isin(seen_retailers).to_numpy()
    if seen_suppliers:
        cold_mask |= ~X["supplier_id"].astype(str).isin(seen_suppliers).to_numpy()

    rule_scores = X.apply(_rule_score, axis=1).values

    # Get predictions (probability of being a good supplier)
    try:
        ml_scores = rf_model.predict_proba(X)[:, 1]
        scores = np.where(cold_mask, rule_scores, ml_scores)
        scoring_strategy = "hybrid"
    except Exception as e:
        print(f"Prediction error: {e}")
        scores = rule_scores
        scoring_strategy = "rules"

    # Rank suppliers
    candidates["recommendation_score"] = scores
    ranked = candidates.sort_values("recommendation_score", ascending=False).head(top_k)

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

    recommendations = (
        result[["supplier_id", "city", "state", "recommendation_score"]]
        .rename(columns={"supplier_id": "seller_id"})
        .to_dict("records")
    )
    meta = {
        "personalization": {"retailer_id": retailer_id is not None, "product_id": product_id is not None},
        "filters": {"seller_state": seller_state is not None, "product_category_name": product_category_name is not None},
        "candidates": {"before_filters": candidates_before_filters, "after_filters": int(len(candidates))},
        "scoring": {
            "strategy": scoring_strategy,
            "cold_start_rows": int(cold_mask.sum()),
            "ml_rows": int((~cold_mask).sum()),
        },
    }
    return recommendations, meta

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
