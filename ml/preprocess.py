from src.data_processing.preprocess import preprocess_olist_data


if __name__ == "__main__":
    frame = preprocess_olist_data()
    print(frame.shape)
