from src.models.train_recommendation import train_recommendation_model


if __name__ == "__main__":
    artifact = train_recommendation_model()
    print(artifact["report"])
