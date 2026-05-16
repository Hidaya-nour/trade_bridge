from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Step 1: Import the middleware
from pydantic import BaseModel, Field

from src.models.predict import forecast_demand, recommend_suppliers_with_meta


app = FastAPI(title="TradeBridge ML API", version="0.1.0")

# <-- Step 2: Configure allowed origins (Your Vite Frontend)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# <-- Step 3: Register the middleware to handle OPTIONS preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, OPTIONS, GET, etc.
    allow_headers=["*"],  # Allows Content-Type and other frontend headers
)


class RecommendationRequest(BaseModel):
    top_k: int = Field(default=5, ge=1, le=20)
    retailer_id: str | None = None
    product_id: str | None = None
    seller_state: str | None = None
    product_category_name: str | None = None


class ForecastRequest(BaseModel):
    product_id: str
    seller_id: str | None = None
    horizon_days: int = Field(default=7, ge=1, le=30)


@app.post("/recommend-supplier")
def recommend_supplier(payload: RecommendationRequest):
    recommendations, meta = recommend_suppliers_with_meta(
        top_k=payload.top_k,
        retailer_id=payload.retailer_id,
        product_id=payload.product_id,
        seller_state=payload.seller_state,
        product_category_name=payload.product_category_name,
    )
    return {"recommendations": recommendations, "meta": meta}


@app.post("/forecast-demand")
def forecast_supplier_demand(payload: ForecastRequest):
    return {
        "forecast": forecast_demand(
            product_id=payload.product_id,
            seller_id=payload.seller_id,
            horizon_days=payload.horizon_days,
        )
    }