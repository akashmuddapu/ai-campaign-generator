"""TDD tests for auth routes — email regex, password strength, and client-side salted hashing."""
import pytest
import json
import hashlib
from pathlib import Path


def client_hash(password: str, email: str) -> str:
    salted = f"campaignguard:{email.strip().lower()}:{password}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


class TestSignup:
    def test_signup_success(self, client, app):
        resp = client.post(
            "/api/auth/signup",
            json={"email": "test@example.com", "name": "Test User", "password": "Secret123!"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["name"] == "Test User"
        assert "password_hash" not in data["user"]
        assert "password" not in data["user"]

    def test_signup_rejects_invalid_email_rubbish(self, client, app):
        rubbish_emails = [
            "@kjgegdv",
            "@dg",
            "test@dg",
            "user@gmail",
            "user@company.org",
            "user@domain.net",
            "plainaddress",
            "user@.com",
            "@domain.com",
        ]
        for em in rubbish_emails:
            resp = client.post(
                "/api/auth/signup",
                json={"email": em, "name": "User", "password": "Secret123!"},
            )
            assert resp.status_code == 400
            data = resp.get_json()
            assert "error" in data
            assert ".com" in data["error"] or "email" in data["error"].lower()

    def test_signup_rejects_weak_passwords(self, client, app):
        weak_passwords = [
            "short",        # < 6 chars
            "nocapitals1!", # no uppercase
            "NOLOWERCASE1!",# no lowercase
            "NoNumbers!",   # no number
            "NoSpecial123", # no special character
            "123456",       # only digits
            "abcdef",       # only lowercase
        ]
        for wp in weak_passwords:
            resp = client.post(
                "/api/auth/signup",
                json={"email": "valid@example.com", "name": "User", "password": wp},
            )
            assert resp.status_code == 400
            data = resp.get_json()
            assert "error" in data

    def test_signup_duplicate_email(self, client, app):
        payload = {"email": "dup@example.com", "name": "User", "password": "Secret123!"}
        client.post("/api/auth/signup", json=payload)
        resp = client.post("/api/auth/signup", json=payload)
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data

    def test_signup_missing_email(self, client, app):
        resp = client.post("/api/auth/signup", json={"name": "User", "password": "Secret123!"})
        assert resp.status_code == 400

    def test_signup_missing_password(self, client, app):
        resp = client.post(
            "/api/auth/signup", json={"email": "test@example.com", "name": "User"}
        )
        assert resp.status_code == 400

    def test_signup_missing_name(self, client, app):
        resp = client.post(
            "/api/auth/signup", json={"email": "test@example.com", "password": "Secret123!"}
        )
        assert resp.status_code == 400

    def test_password_not_stored_as_plaintext(self, client, app):
        client.post(
            "/api/auth/signup",
            json={"email": "hash@example.com", "name": "Hash User", "password": "Secret123!"},
        )
        users_file = Path(app.config["DATA_DIR"]) / "users.json"
        users = json.loads(users_file.read_text())
        user = next(u for u in users if u["email"] == "hash@example.com")
        assert user.get("password_hash") != "Secret123!"
        assert "password_hash" in user
        assert user["password_hash"].startswith("pbkdf2:") or user["password_hash"].startswith("scrypt:")

    def test_signup_returns_id(self, client, app):
        resp = client.post(
            "/api/auth/signup",
            json={"email": "id@example.com", "name": "ID User", "password": "Secret123!"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert "id" in data["user"]

    def test_signup_with_client_side_hash(self, client, app):
        email = "clienthash@example.com"
        c_hash = client_hash("MySecretPass99#", email)
        resp = client.post(
            "/api/auth/signup",
            json={"email": email, "name": "Client Hash User", "password": c_hash},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["user"]["email"] == email

    def test_different_users_same_password_have_different_client_hashes(self):
        pw = "UniversalPass1!"
        h1 = client_hash(pw, "alice@company.com")
        h2 = client_hash(pw, "bob@company.com")
        assert h1 != h2, "Client hashes for same password must differ due to email salting"


class TestLogin:
    def _signup(self, client, email="login@example.com", password="Secret123!"):
        client.post("/api/auth/signup", json={"email": email, "name": "Login User", "password": password})

    def test_login_success(self, client, app):
        self._signup(client)
        resp = client.post(
            "/api/auth/login", json={"email": "login@example.com", "password": "Secret123!"}
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "user" in data
        assert data["user"]["email"] == "login@example.com"
        assert "password_hash" not in data["user"]

    def test_login_rejects_rubbish_email(self, client, app):
        resp = client.post(
            "/api/auth/login", json={"email": "@kjgegdv", "password": "Secret123!"}
        )
        assert resp.status_code == 400
        data = resp.get_json()
        assert ".com" in data["error"] or "email" in data["error"].lower()

    def test_login_with_client_hash(self, client, app):
        email = "c_user@company.com"
        plain_pw = "ClientTest99$"
        c_hash = client_hash(plain_pw, email)

        # Signup with client hash
        client.post("/api/auth/signup", json={"email": email, "name": "Client User", "password": c_hash})

        # Login with client hash
        resp = client.post("/api/auth/login", json={"email": email, "password": c_hash})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["email"] == email

    def test_login_wrong_password(self, client, app):
        self._signup(client, email="wrongpw@example.com")
        resp = client.post(
            "/api/auth/login", json={"email": "wrongpw@example.com", "password": "WrongPassword99!"}
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client, app):
        resp = client.post(
            "/api/auth/login", json={"email": "ghost@example.com", "password": "Secret123!"}
        )
        assert resp.status_code == 401

    def test_login_missing_fields(self, client, app):
        resp = client.post("/api/auth/login", json={"email": "test@example.com"})
        assert resp.status_code == 400


class TestLogout:
    def test_logout_success(self, client, app):
        client.post(
            "/api/auth/signup",
            json={"email": "logout@example.com", "name": "Logout User", "password": "Secret123!"},
        )
        client.post("/api/auth/login", json={"email": "logout@example.com", "password": "Secret123!"})
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200

    def test_logout_when_not_logged_in(self, client, app):
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200


class TestMe:
    def test_me_authenticated(self, client, app):
        client.post(
            "/api/auth/signup",
            json={"email": "me@example.com", "name": "Me User", "password": "Secret123!"},
        )
        client.post("/api/auth/login", json={"email": "me@example.com", "password": "Secret123!"})
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
