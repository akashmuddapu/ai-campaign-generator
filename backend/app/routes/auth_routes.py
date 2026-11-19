"""Authentication routes: signup, login, logout, me."""
from flask import Blueprint, request, session, jsonify, current_app
from pathlib import Path

from ..models.user import User
from ..services import storage_service

auth_bp = Blueprint("auth", __name__)


def _users_path() -> str:
    return str(Path(current_app.config["DATA_DIR"]) / "users.json")


def _load_users():
    raw = storage_service.read_json(_users_path(), default=[])
    if isinstance(raw, dict):
        return raw.get("users", [])
    elif isinstance(raw, list):
        return raw
    return []


def _save_users(users):
    storage_service.write_json(_users_path(), users)


@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    name = data.get("name", "").strip()
    password = data.get("password", "")

    if not email or not name or not password:
        return jsonify({"error": "email, name, and password are required"}), 400

    users = _load_users()
    if any(u.get("email", "").lower() == email.lower() for u in users if isinstance(u, dict)):
        return jsonify({"error": "Email already registered"}), 400

    user = User(email=email, name=name)
    user.password_hash = User.hash_password(password)

    users.append(user.to_storage_dict())
    _save_users(users)

    session["user_id"] = user.id
    return jsonify({"status": "success", "user": user.to_public_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    users = _load_users()
    user_dict = next(
        (u for u in users if isinstance(u, dict) and u.get("email", "").lower() == email.lower()),
        None
    )

    if not user_dict:
        return jsonify({"error": "Invalid credentials"}), 401

    user = User.from_dict(user_dict)
    if not User.verify_password(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["user_id"] = user.id
    return jsonify({"status": "success", "user": user.to_public_dict()}), 200


@auth_bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify({"status": "success", "message": "Logged out"}), 200


@auth_bp.get("/me")
def me():
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"authenticated": False, "user": None}), 200

    users = _load_users()
    user_dict = next(
        (u for u in users if isinstance(u, dict) and u.get("id") == str(user_id)),
        None
    )
    if not user_dict:
        session.pop("user_id", None)
        return jsonify({"authenticated": False, "user": None}), 200

    session["user_id"] = str(user_id)
    user = User.from_dict(user_dict)
    return jsonify({"authenticated": True, "user": user.to_public_dict()}), 200
