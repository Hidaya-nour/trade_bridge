import argparse
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


def parse_args():
    parser = argparse.ArgumentParser(description='Train a demand forecasting model for inventory management.')
    parser.add_argument('--input', type=str, default='data/demand_data.csv', help='Path to sales history CSV file.')
    parser.add_argument('--output', type=str, default='models/demand_forecast_model.pkl', help='Path to save trained model artifact.')
    parser.add_argument('--test-size', type=float, default=0.2, help='Fraction of data to use for testing.')
    return parser.parse_args()


def load_sales_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=['date'])
    required_columns = {'date', 'product_id', 'quantity_sold'}
    if not required_columns.issubset(df.columns):
        raise ValueError(f'Input file must contain columns: {required_columns}')
    df = df[['date', 'product_id', 'quantity_sold']].copy()
    df['quantity_sold'] = df['quantity_sold'].astype(float)
    return df


def aggregate_daily_sales(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df.groupby(['product_id', 'date'], as_index=False)
        .agg({'quantity_sold': 'sum'})
        .sort_values(['product_id', 'date'])
    )


def create_features(df: pd.DataFrame, lags=7) -> pd.DataFrame:
    df = df.copy()
    df['day_of_week'] = df['date'].dt.weekday
    df['month'] = df['date'].dt.month

    for lag in range(1, lags + 1):
        df[f'lag_{lag}'] = df.groupby('product_id')['quantity_sold'].shift(lag)

    df = df.dropna().reset_index(drop=True)
    return df


def build_training_data(df: pd.DataFrame, lags=7):
    encoded_product = LabelEncoder()
    df['product_id_encoded'] = encoded_product.fit_transform(df['product_id'])
    df = create_features(df, lags=lags)

    feature_cols = [f'lag_{i}' for i in range(1, lags + 1)] + ['day_of_week', 'month', 'product_id_encoded']
    X = df[feature_cols].astype(float)
    y = df['quantity_sold'].astype(float)

    return X, y, feature_cols, encoded_product


def train_and_evaluate_model(X: pd.DataFrame, y: pd.Series, test_size: float):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42, shuffle=False)

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Training metrics
    train_preds = model.predict(X_train)
    train_mae = mean_absolute_error(y_train, train_preds)
    train_rmse = np.sqrt(mean_squared_error(y_train, train_preds))

    # Test metrics
    test_preds = model.predict(X_test)
    test_mae = mean_absolute_error(y_test, test_preds)
    test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))

    print(f'Training MAE: {train_mae:.4f}, RMSE: {train_rmse:.4f}')
    print(f'Test MAE: {test_mae:.4f}, RMSE: {test_rmse:.4f}')

    return model, train_mae, train_rmse, test_mae, test_rmse


def make_forecasts(model, encoder, history: pd.DataFrame, feature_cols, start_date: pd.Timestamp, days: int, lags=7):
    history = history.copy()
    history = history.sort_values('date').reset_index(drop=True)
    last_history = history.tail(lags).copy()

    if len(last_history) < lags:
        raise ValueError(f'Need at least {lags} days of history to forecast. Found {len(last_history)} days.')

    forecast_rows = []
    current_values = last_history['quantity_sold'].tolist()
    product_encoded = int(encoder.transform([history['product_id'].iloc[-1]])[0])

    for day in range(days):
        forecast_date = start_date + pd.Timedelta(days=day)
        features = {
            f'lag_{i}': current_values[-i] for i in range(1, lags + 1)
        }
        features['day_of_week'] = int(forecast_date.weekday())
        features['month'] = int(forecast_date.month)
        features['product_id_encoded'] = product_encoded

        feature_vector = pd.DataFrame([features], columns=feature_cols).astype(float)
        next_qty = float(model.predict(feature_vector)[0])
        next_qty = max(next_qty, 0.0)
        forecast_rows.append({'date': forecast_date.strftime('%Y-%m-%d'), 'forecast_quantity': round(next_qty, 2)})
        current_values.append(next_qty)

    return pd.DataFrame(forecast_rows)


def main():
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        raise FileNotFoundError(f'Input CSV not found: {input_path}')

    df = load_sales_data(str(input_path))
    df = aggregate_daily_sales(df)

    X, y, feature_cols, encoder = build_training_data(df)

    if X.empty:
        raise ValueError('Not enough data after feature creation. Please provide at least 8 days of sales history per product.')

    model, train_mae, train_rmse, test_mae, test_rmse = train_and_evaluate_model(X, y, args.test_size)

    artifact = {
        'model': model,
        'encoder': encoder,
        'feature_cols': feature_cols,
        'lags': 7,
    }
    joblib.dump(artifact, str(output_path))
    print(f'Model artifact saved to {output_path}')

    # Forecast next 7 days using full data
    last_date = df['date'].max() + pd.Timedelta(days=1)
    forecast = make_forecasts(model, encoder, df, feature_cols, last_date, 7, lags=7)
    print('Next 7 day forecast:')
    print(forecast.to_string(index=False))


if __name__ == '__main__':
    main()
