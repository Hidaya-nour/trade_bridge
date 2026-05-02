# TradeBridge ML

Production-ready starter ML workspace for TradeBridge using the Olist dataset.

## Structure

```text
ml/
  app.py
  build_features.py
  load_data.py
  predict.py
  preprocess.py
  train_forecast.py
  train_recommendation.py
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
      build_features.py
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
5. Serve predictions with FastAPI

## Commands

### Load / validate raw data

```bash
cd ml
python load_data.py
```

### Preprocess Olist data

```bash
cd ml
python preprocess.py
```

# Build feature datasets
python -m src.features.build_demand_features
python -m src.features.build_recommendation_features

# Train models
python -m src.models.train_forecast
python -m src.models.train_recommendation

# Run API
uvicorn src.api.app:app --reload
```bash
cd ml
uvicorn app:app --reload
```

## Endpoints

### `POST /recommend-supplier`

Request body:

```json
{
  "top_k": 5,
  "seller_state": "SP",
  "product_category_name": "beleza_saude"
}
```

### `POST /forecast-demand`

Request body:

```json
{
  "product_id": "123",
  "seller_id": "abc",
  "horizon_days": 7
}
```
