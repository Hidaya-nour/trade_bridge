from src.features.build_features import build_all_features


if __name__ == "__main__":
    supplier_frame, demand_frame = build_all_features()
    print("supplier_features:", supplier_frame.shape)
    print("demand_dataset:", demand_frame.shape)
