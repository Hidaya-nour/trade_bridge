# Demand Forecasting and Supplier Recommendation

This folder contains machine learning pipelines for demand forecasting and supplier recommendation.

## Data Preparation

First, export data from the Trade Bridge database:

1. Run the data export script from the backend:

```bash
cd backend
npx ts-node src/utils/export-ml-data.ts
```

This will create:
- `ml/data/demand_data.csv` — Historical sales data for demand forecasting
- `ml/data/supplier_data.csv` — Supplier performance data for recommendation

## Demand Forecasting

Predicts future demand quantities for products based on historical sales.

### Dataset format
`demand_data.csv`:
- `date` — ISO date string, e.g. `2026-04-01`
- `product_id` — product identifier
- `quantity_sold` — number of units sold on that date

### Training
```bash
python demand_forecasting.py --input data/demand_data.csv --output models/demand_forecast_model.pkl
```

Example output:
```
Training MAE: 0.9950, RMSE: 1.0198
Test MAE: 1.8900, RMSE: 2.4380
Model artifact saved to models\demand_forecast_model.pkl
```

### Prediction
```bash
python predict.py --model models/demand_forecast_model.pkl --product-id <product_id> --days 7 --history-file data/demand_data.csv
```

## Supplier Recommendation

Classifies suppliers by suitability score (1-5) based on performance metrics.

### Dataset format
`supplier_data.csv`:
- `supplier_id` — supplier identifier
- `on_time_delivery_rate` — percentage of on-time deliveries
- `quality_rating` — average quality rating
- `order_fulfillment_time` — average fulfillment time in days
- `price_competitiveness` — average price score
- `total_orders` — total orders processed
- `suitability_score` — target score (1-5)

### Training
```bash
python supplier_recommendation.py --input data/supplier_data.csv --output models/supplier_recommendation_model.pkl
```

Example output:
```
Training Accuracy: 1.0000, F1: 1.0000
Test Accuracy: 1.0000, Precision: 1.0000, Recall: 1.0000, F1: 1.0000
Model artifact saved to models\supplier_recommendation_model.pkl
```

## Evaluation

Both scripts now include proper train/test splits and print evaluation metrics:
- Demand Forecasting: MAE, RMSE on training and test sets
- Supplier Recommendation: Accuracy, Precision, Recall, F1

## Notes
- Use real data from `export-ml-data.ts` for production models
- Models are trained locally with CPU
- Artifacts include scalers and encoders for inference
