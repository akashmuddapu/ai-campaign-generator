import uuid
from dataclasses import dataclass, field
from werkzeug.security import generate_password_hash, check_password_hash


@dataclass
class User:
    email: str
    name: str
    password_hash: str = ""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    @staticmethod
    def hash_password(plain: str) -> str:
        return generate_password_hash(plain)

    @staticmethod
    def verify_password(hash_: str, plain: str) -> bool:
        return check_password_hash(hash_, plain)

    def to_public_dict(self) -> dict:
        return {"id": self.id, "email": self.email, "name": self.name}

    def to_storage_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "password_hash": self.password_hash,
        }

    @staticmethod
    def from_dict(d: dict) -> "User":
        u = User(email=d["email"], name=d["name"], password_hash=d.get("password_hash", ""))
        u.id = d.get("id", u.id)
        return u
