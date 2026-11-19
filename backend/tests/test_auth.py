"""TDD tests for auth routes — written BEFORE implementation."""
import pytest
import json
from pathlib import Path


class TestSignup:
    def test_signup_success(self, client, app):
        resp = client.post(
            "/api/auth/signup",
            json={"email": "test@example.com", "name": "Test User", "password": "secret123"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["name"] == "Test User"
        # Must NOT return password_hash
        assert "password_hash" not in data["user"]
        assert "password" not in data["user"]

    def test_signup_duplicate_email(self, client, app):
        payload = {"email": "dup@example.com", "name": "User", "password": "pass123"}
        client.post("/api/auth/signup", json=payload)
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data

    def test_signup_missing_email(self, client, app):
        resp = client.post("/api/auth/signup", json={"name": "User", "password": "pass123"})
        assert resp.status_code == 400

    def test_signup_missing_password(self, client, app):
        resp = client.post(
            "/api/auth/signup", json={"email": "test@example.com", "name": "User"}
        )
        assert resp.status_code == 400

    def test_signup_missing_name(self, client, app):
        resp = client.post(
            "/api/auth/signup", json={"email": "test@example.com", "password": "pass123"}
        )
        assert resp.status_code == 400

    def test_password_not_stored_as_plaintext(self, client, app):
        client.post(
            "/api/auth/signup",
            json={"email": "hash@example.com", "name": "Hash User", "password": "mypassword"},
        )
        users_file = Path(app.config["DATA_DIR"]) / "users.json"
        users = json.loads(users_file.read_text())
        user = next(u for u in users if u["email"] == "hash@example.com")
        assert user.get("password_hash") != "mypassword"
        assert "password_hash" in user
        assert user["password_hash"].startswith("pbkdf2:") or user["password_hash"].startswith("scrypt:")

    def test_signup_returns_id(self, client, app):
        resp = client.post(
            "/api/auth/signup",
            json={"email": "id@example.com", "name": "ID User", "password": "pass123"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert "id" in data["user"]


class TestLogin:
    def _signup(self, client, email="login@example.com", password="pass123"):
        client.post("/api/auth/signup", json={"email": email, "name": "Login User", "password": password})

    def test_login_success(self, client, app):
        self._signup(client)
        resp = client.post(
            "/api/auth/login", json={"email": "login@example.com", "password": "pass123"}
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "user" in data
        assert data["user"]["email"] == "login@example.com"
        assert "password_hash" not in data["user"]

    def test_login_wrong_password(self, client, app):
        self._signup(client, email="wrongpw@example.com")
        resp = client.post(
            "/api/auth/login", json={"email": "wrongpw@example.com", "password": "wrongpassword"}
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client, app):
        resp = client.post(
            "/api/auth/login", json={"email": "ghost@example.com", "password": "pass123"}
        )
        assert resp.status_code == 401

    def test_login_missing_fields(self, client, app):
        resp = client.post("/api/auth/login", json={"email": "test@example.com"})
        assert resp.status_code == 400


class TestLogout:
    def test_logout_success(self, client, app):
        # Sign up and login first
        client.post(
            "/api/auth/signup",
            json={"email": "logout@example.com", "name": "Logout User", "password": "pass123"},
        )
        client.post("/api/auth/login", json={"email": "logout@example.com", "password": "pass123"})
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200

    def test_logout_when_not_logged_in(self, client, app):
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200


class TestMe:
    def test_me_authenticated(self, client, app):
        client.post(
            "/api/auth/signup",
            json={"email": "me@example.com", "name": "Me User", "password": "pass123"},
        )
        client.post("/api/auth/login", json={"email": "me@example.com", "password": "pass123"})
        resp = client.get("/api/auth/me")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["authenticated"] is True
        assert data["user"]["email"] == "me@example.com"
        assert "password_hash" not in data["user"]

    def test_me_not_authenticated(self, client, app):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["authenticated"] is False
        assert data["user"] is None
