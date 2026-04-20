from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.models.predict import forecast_demand, recommend_suppliers


app = FastAPI(title="TradeBridge ML API", version="0.1.0")


class RecommendationRequest(BaseModel):
    top_k: int = Field(default=5, ge=1, le=20)
    seller_state: str | None = None
    product_category_name: str | None = None


class ForecastRequest(BaseModel):
    product_id: str
    seller_id: str | None = None
    horizon_days: int = Field(default=7, ge=1, le=30)


@app.post("/recommend-supplier")
def recommend_supplier(payload: RecommendationRequest):
    return {
        "recommendations": recommend_suppliers(
            top_k=payload.top_k,
            seller_state=payload.seller_state,
            product_category_name=payload.product_category_name,
        )
    }


@app.post("/forecast-demand")
def forecast_supplier_demand(payload: ForecastRequest):
    return {
        "forecast": forecast_demand(
            product_id=payload.product_id,
            seller_id=payload.seller_id,
            horizon_days=payload.horizon_days,
        )
    }
