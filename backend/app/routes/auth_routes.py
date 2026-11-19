"""Authentication routes: signup, login, logout, me."""
import re
import hashlib
from flask import Blueprint, request, session, jsonify, current_app
from pathlib import Path

from ..models.user import User
from ..services import storage_service

auth_bp = Blueprint("auth", __name__)

# Strict regular expression: Only valid emails ending with .com (rejects rubbish like @kjgegdv, @dg, etc.)
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@(?:[a-zA-Z0-9-]+\.)+com$", re.IGNORECASE)


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password: min 6 chars, >= 1 uppercase, >= 1 lowercase, >= 1 number, >= 1 special symbol."""
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one capital letter (A-Z)."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter (a-z)."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number (0-9)."
    if not re.search(r"[^a-zA-Z0-9\s]", password):
        return False, "Password must contain at least one special symbol (e.g. !@#$%^&*)."
    return True, ""


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

    # Rule 1: Strict .com email regex validation
    if not EMAIL_REGEX.match(email):
        return jsonify({
            "error": "Invalid email address. Only valid email addresses ending with .com are permitted (e.g. name@company.com)."
        }), 400

    # Rule 2: Password validation (if plain password sent directly; client hashes are 64 hex chars)
    is_client_hash = bool(re.match(r"^[a-fA-F0-9]{64}$", password))
    if not is_client_hash:
        ok, err = validate_password_strength(password)
        if not ok:
            return jsonify({"error": err}), 400

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

    # Rule 1: Strict .com email regex validation
    if not EMAIL_REGEX.match(email):
        return jsonify({
            "error": "Invalid email address. Please enter a valid email ending with .com (e.g. name@company.com)."
        }), 400

    users = _load_users()
    user_dict = next(
        (u for u in users if isinstance(u, dict) and u.get("email", "").lower() == email.lower()),
        None
    )

    if not user_dict:
        return jsonify({"error": "Invalid credentials"}), 401

    user = User.from_dict(user_dict)

    # Rule 3: Support client-side hashed password with email salt or direct check
    matched = User.verify_password(user.password_hash, password)
    if not matched:
        salted = f"campaignguard:{email.lower()}:{password}"
        c_hash = hashlib.sha256(salted.encode("utf-8")).hexdigest()
        matched = User.verify_password(user.password_hash, c_hash)

    if not matched:
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
