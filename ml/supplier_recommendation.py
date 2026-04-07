import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def parse_args():
    parser = argparse.ArgumentParser(description='Train a supplier recommendation model.')
    parser.add_argument('--input', type=str, default='data/supplier_data.csv', help='Path to supplier data CSV file.')
    parser.add_argument('--output', type=str, default='models/supplier_recommendation_model.pkl', help='Path to save trained model artifact.')
    parser.add_argument('--test-size', type=float, default=0.2, help='Fraction of data to use for testing.')
    return parser.parse_args()


def load_supplier_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required_columns = {'supplier_id', 'on_time_delivery_rate', 'quality_rating', 'order_fulfillment_time', 'price_competitiveness', 'total_orders', 'suitability_score'}
    if not required_columns.issubset(df.columns):
        raise ValueError(f'Input file must contain columns: {required_columns}')
    return df


def preprocess_data(df: pd.DataFrame):
    # Features
    feature_cols = ['on_time_delivery_rate', 'quality_rating', 'order_fulfillment_time', 'price_competitiveness', 'total_orders']
    X = df[feature_cols].copy()

    # Normalize numerical features
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=feature_cols)

    # Target: suitability_score (1-5, but we'll treat as classification)
    y = df['suitability_score'].astype(int)

    return X_scaled, y, feature_cols, scaler


def train_and_evaluate_model(X: pd.DataFrame, y: pd.Series, test_size: float):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Training metrics
    train_preds = model.predict(X_train)
    train_accuracy = accuracy_score(y_train, train_preds)
    train_f1 = f1_score(y_train, train_preds, average='weighted')

    # Test metrics
    test_preds = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, test_preds)
    test_precision = precision_score(y_test, test_preds, average='weighted', zero_division=0)
    test_recall = recall_score(y_test, test_preds, average='weighted', zero_division=0)
    test_f1 = f1_score(y_test, test_preds, average='weighted', zero_division=0)

    print(f'Training Accuracy: {train_accuracy:.4f}, F1: {train_f1:.4f}')
    print(f'Test Accuracy: {test_accuracy:.4f}, Precision: {test_precision:.4f}, Recall: {test_recall:.4f}, F1: {test_f1:.4f}')

    return model, train_accuracy, test_accuracy, test_f1


def main():
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        raise FileNotFoundError(f'Input CSV not found: {input_path}')

    df = load_supplier_data(str(input_path))

    if df.empty:
        raise ValueError('No data found in input file.')

    X, y, feature_cols, scaler = preprocess_data(df)

    model, train_acc, test_acc, test_f1 = train_and_evaluate_model(X, y, args.test_size)

    artifact = {
        'model': model,
        'scaler': scaler,
        'feature_cols': feature_cols,
    }
    joblib.dump(artifact, str(output_path))
    print(f'Model artifact saved to {output_path}')


if __name__ == '__main__':
    main()