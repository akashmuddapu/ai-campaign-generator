"""Thread-safe atomic JSON persistence."""
import json
import os
import tempfile
import threading
from pathlib import Path
from typing import Any, Dict

_locks: Dict[str, threading.Lock] = {}
_locks_lock = threading.Lock()


def _get_lock(path: str) -> threading.Lock:
    with _locks_lock:
        if path not in _locks:
            _locks[path] = threading.Lock()
        return _locks[path]


def read_json(path: str, default=None) -> Any:
    lock = _get_lock(path)
    with lock:
        if not Path(path).exists():
            return default if default is not None else []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return default if default is not None else []


def write_json(path: str, data: Any) -> None:
    lock = _get_lock(path)
    with lock:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            delete=False,
            dir=str(Path(path).parent),
            suffix=".tmp",
        ) as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            tmp_path = f.name
        os.replace(tmp_path, path)
