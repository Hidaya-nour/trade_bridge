from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import pandas as pd


def ensure_directory(path: str | Path) -> Path:
    target = Path(path)
    target.mkdir(parents=True, exist_ok=True)
    return target


def ensure_parent(path: str | Path) -> Path:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    return target


def read_csv(path: str | Path, **kwargs: Any) -> pd.DataFrame:
    return pd.read_csv(path, **kwargs)


def write_csv(frame: pd.DataFrame, path: str | Path) -> Path:
    target = ensure_parent(path)
    frame.to_csv(target, index=False)
    return target


def save_joblib(obj: Any, path: str | Path) -> Path:
    target = ensure_parent(path)
    joblib.dump(obj, target)
    return target


def load_joblib(path: str | Path) -> Any:
    return joblib.load(path)
