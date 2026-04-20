from src.models.train_forecast import train_forecast_model


if __name__ == "__main__":
    artifact = train_forecast_model()
    print(artifact["metrics"])
