import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")
    SESSION_TYPE = "filesystem"
    SESSION_FILE_DIR = str(BASE_DIR / "data" / "sessions")
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    AI_PROVIDER = os.environ.get("AI_PROVIDER", "mock")
    AI_FALLBACK_ENABLED = os.environ.get("AI_FALLBACK_ENABLED", "true").lower() == "true"
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GROK_API_KEY = os.environ.get("GROK_API_KEY", "")
    DATA_DIR = str(BASE_DIR / "data")
