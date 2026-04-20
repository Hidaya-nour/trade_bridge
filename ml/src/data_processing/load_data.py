from __future__ import annotations

from typing import Dict

import pandas as pd

from src.config import RAW_DATA_DIR, REQUIRED_OLIST_FILES


def load_olist_data(raw_data_dir=RAW_DATA_DIR) -> Dict[str, pd.DataFrame]:
    datasets: Dict[str, pd.DataFrame] = {}

    for key, filename in REQUIRED_OLIST_FILES.items():
        file_path = raw_data_dir / filename
        if not file_path.exists():
            raise FileNotFoundError(f"Missing required dataset: {file_path}")
        datasets[key] = pd.read_csv(file_path)

    return datasets


if __name__ == "__main__":
    loaded = load_olist_data()
    for name, frame in loaded.items():
        print(f"{name}: {frame.shape}")
