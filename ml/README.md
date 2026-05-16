# TradeBridge ML

Production-ready starter ML workspace for TradeBridge using the Olist dataset plus a read-only TradeBridge DB snapshot.

## Structure

```text
ml/
  load_data.py
  predict.py
  preprocess.py
  requirements.txt
  data/
    raw/
    processed/
  models/
  src/
    api/
      app.py
    common/
      io.py
    data_processing/
      load_data.py
      preprocess.py
    features/
      build_demand_features.py
      build_recommendation_features.py
    models/
      train_recommendation.py
      train_forecast.py
      predict.py
    config.py
```

## Workflow

1. Put all Olist CSV files in `data/raw/`
2. Run preprocessing
3. Build supplier and demand features
4. Train the recommendation and forecast models
5. Export the app snapshot from the backend
6. Serve predictions with FastAPI

## Commands

### 0) Set up Python deps

```bash
cd ml
python -m pip install -r requirements.txt
```

### 1) Load / validate raw data

```bash
cd ml
python load_data.py
```

### 2) Preprocess Olist data

```bash
cd ml
python preprocess.py
```

### 3) Build feature datasets

```bash
cd ml
python -m src.features.build_demand_features
python -m src.features.build_recommendation_features
```

### 4) Train models

```bash
cd ml
python -m src.models.train_forecast
python -m src.models.train_recommendation
```

### 5) Export TradeBridge app data without changing the DB

The recommendation model is trained on dataset-scale Olist data, but live recommendations should return real TradeBridge distributors. Export a read-only snapshot:

```bash
cd backend
npm run ml:export
```

This writes `ml/data/processed/tradebridge_snapshot.json`. The ML API uses it when present, filters candidates to active `distributor` users, excludes factories, and returns TradeBridge distributor IDs.

### 6) Run the ML API

```bash
cd ml
uvicorn src.api.app:app --reload --port 8000
```

### Optional CLI predictions

```bash
cd ml
python predict.py recommend-supplier --top-k 5 --retailer-id <tradebridge_retailer_id> --product-id <tradebridge_product_id>
python predict.py forecast-demand --product-id <product_id> --horizon-days 7
```

## Recommendation Behavior

- If `tradebridge_snapshot.json` exists, `/recommend-supplier` uses `meta.source = "tradebridge_snapshot"` and `meta.scoring.strategy = "ml_bridge"`.
- In that path, active TradeBridge distributors are projected into the trained Olist feature space, scored by the model, and lightly blended with retailer purchase/category signals.
- If the snapshot is missing, the API falls back to the Olist-only path. App UUIDs are unseen by Olist, so cold-start fallback can still happen.

## Demo Proof Points

1. Offline metrics: training writes `ml/data/processed/supplier_model_metrics.json`.
2. Personalization: export the TradeBridge snapshot, then call the endpoint with different retailer/product UUIDs and compare the distributor rankings.
3. Candidate correctness: app recommendations should return TradeBridge distributor IDs, not Olist seller IDs or factory IDs.

## Endpoints

### `POST /recommend-supplier`

```json
{
  "top_k": 5,
  "retailer_id": "tradebridge_retailer_id",
  "product_id": "tradebridge_product_id",
  "product_category_name": "food"
}
```

Response shape:

```json
{
  "recommendations": [
    {
      "seller_id": "tradebridge_distributor_id",
      "name": "Distributor Business",
      "recommendation_score": 0.93
    }
  ],
  "meta": {
    "source": "tradebridge_snapshot",
    "personalization": { "retailer_id": true, "product_id": true },
    "scoring": { "strategy": "ml_bridge", "cold_start_rows": 0, "ml_rows": 12 }
  }
}
```

### `POST /forecast-demand`

```json
{
  "product_id": "123",
  "seller_id": "abc",
  "horizon_days": 7
}
```
