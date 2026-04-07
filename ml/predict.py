import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


def parse_args():
    parser = argparse.ArgumentParser(description='Use a trained demand forecasting model to predict future inventory demand.')
    parser.add_argument('--model', type=str, default='models/demand_forecast_model.pkl', help='Model artifact path.')
    parser.add_argument('--product-id', type=str, required=True, help='Product ID to forecast.')
    parser.add_argument('--days', type=int, default=14, help='Number of forecast days.')
    parser.add_argument('--history-file', type=str, default='data/sample_sales.csv', help='Path to history CSV file.')
    return parser.parse_args()


def load_history(path: Path, product_id: str) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f'History file not found: {path}')

    df = pd.read_csv(path, parse_dates=['date'])
    required_columns = {'date', 'product_id', 'quantity_sold'}
    if not required_columns.issubset(df.columns):
        raise ValueError(f'History file must contain columns: {required_columns}')

    df = df[df['product_id'] == product_id][['date', 'product_id', 'quantity_sold']].copy()
    if df.empty:
        raise ValueError(f'No rows found for product_id={product_id} in {path}')

    df = df.groupby(['product_id', 'date'], as_index=False).agg({'quantity_sold': 'sum'}).sort_values('date')
    return df


def make_forecast(artifact, history: pd.DataFrame, days: int):
    feature_cols = artifact['feature_cols']
    lags = artifact.get('lags', 7)
    model = artifact['model']
    encoder = artifact['encoder']

    if len(history) < lags:
        raise ValueError(f'Need at least {lags} days of history for forecasting. Found {len(history)} days.')

    current_values = history['quantity_sold'].tolist()
    product_encoded = int(encoder.transform([history['product_id'].iloc[-1]])[0])
    forecast_rows = []
    start_date = history['date'].max() + pd.Timedelta(days=1)

    for day in range(days):
        forecast_date = start_date + pd.Timedelta(days=day)
        features = {f'lag_{i}': current_values[-i] for i in range(1, lags + 1)}
        features['day_of_week'] = int(forecast_date.weekday())
        features['month'] = int(forecast_date.month)
        features['product_id_encoded'] = product_encoded
        feature_vector = pd.DataFrame([features], columns=feature_cols).astype(float)
        qty = float(model.predict(feature_vector)[0])
        qty = max(qty, 0.0)
        forecast_rows.append({'date': forecast_date.strftime('%Y-%m-%d'), 'forecast_quantity': round(qty, 2)})
        current_values.append(qty)

    return pd.DataFrame(forecast_rows)


def main():
    args = parse_args()
    model_path = Path(args.model)
    artifact = joblib.load(model_path)
    history = load_history(Path(args.history_file), args.product_id)
    forecast = make_forecast(artifact, history, args.days)
    print(forecast.to_json(orient='records', date_format='iso'))


if __name__ == '__main__':
    main()
