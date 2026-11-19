"""Preset routes — returns brand kit presets."""
from flask import Blueprint, jsonify, current_app
from pathlib import Path
from ..services import storage_service

preset_bp = Blueprint("preset", __name__)


@preset_bp.get("/presets")
def get_presets():
    data_dir = Path(current_app.config["DATA_DIR"])
    presets_path = data_dir / "brand_kits.json"

    if not presets_path.exists():
        # Fallback to root data folder
        base = Path(__file__).resolve().parent.parent.parent / "data" / "brand_kits.json"
        presets_path = base

    presets = storage_service.read_json(str(presets_path), default=[])
    return jsonify({"status": "success", "presets": presets}), 200
