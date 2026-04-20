from src.data_processing.load_data import load_olist_data


if __name__ == "__main__":
    datasets = load_olist_data()
    for name, frame in datasets.items():
        print(f"{name}: {frame.shape}")
