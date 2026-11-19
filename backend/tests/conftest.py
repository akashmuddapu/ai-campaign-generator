import pytest
import os
import tempfile
import json
from pathlib import Path


@pytest.fixture
def app():
    """Create Flask test app with temp data dir."""
    td = tempfile.mkdtemp()
    # Pre-create sessions dir
    Path(td, "sessions").mkdir()
    # Write empty users.json
    Path(td, "users.json").write_text("[]")

    test_config = {
        "TESTING": True,
        "SECRET_KEY": "test-secret",
        "SESSION_TYPE": "filesystem",
        "SESSION_FILE_DIR": str(Path(td, "sessions")),
        "AI_PROVIDER": "mock",
        "AI_FALLBACK_ENABLED": True,
        "GEMINI_API_KEY": "",
        "GROK_API_KEY": "",
        "DATA_DIR": td,
    }

    from app import create_app
    application = create_app(test_config)
    application.config["DATA_DIR"] = td
    yield application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_brand_kit():
    return {
        "product_name": "CyberShield",
        "product_description": "AI-powered enterprise cybersecurity platform",
        "brand_tone": "authoritative, technical, trustworthy",
        "tagline": "Defend the Future",
        "banned_words": ["cheap", "easy", "basic"],
        "example_brand_lines": ["Zero-tolerance security posture", "Enterprise-grade protection"],
    }


@pytest.fixture
def sample_persona():
    return {
        "persona_name": "Enterprise CISO",
        "primary_goals": "Reduce security breach risk",
        "pain_points": "Complex compliance requirements",
        "core_motivations": "Protecting organizational assets",
        "emotional_triggers": "Fear of breach, desire for control",
        "preferred_message_style": "Data-driven, formal",
        "buying_triggers": "ROI evidence, compliance certification",
    }
