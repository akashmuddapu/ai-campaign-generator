"""AI provider abstraction layer and provider factory with resilient runtime fallback."""
import os
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class BaseAIProvider(ABC):
    """Abstract interface for all AI providers in CampaignGuard AI."""

    @abstractmethod
    def generate_persona_dna(self, brand_kit: dict, persona: dict) -> dict:
        """Generate Persona DNA / audience strategy from Brand Kit and Persona."""
        pass

    @abstractmethod
    def generate_campaign_concepts(self, brand_kit: dict, persona_dna: dict) -> List[dict]:
        """Generate at least 3 distinct campaign concepts."""
        pass

    @abstractmethod
    def generate_social_post(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        """Generate a social post asset (content dict with text, character_count, hashtags)."""
        pass

    @abstractmethod
    def generate_email(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        """Generate an email asset (content dict with subject, body, word_count)."""
        pass

    @abstractmethod
    def evaluate_brand_fit(self, content: str, brand_kit: dict, persona: dict, channel: str) -> dict:
        """Semantically evaluate Brand Fit, Persona Fit, and Channel Fit."""
        pass

    @abstractmethod
    def generate_explanation(self, content: dict, brand_kit: dict, persona: dict, concept: dict, channel: str) -> dict:
        """Generate 'Why This Content?' business rationale."""
        pass

    @abstractmethod
    def auto_fix_content(self, channel_type: str, current_content: dict, violations: List[str], brand_kit: dict, persona: dict, concept: dict) -> dict:
        """AI-guided Auto-Fix enforcing negative constraints."""
        pass

    def suggest_personas(self, product_name: str, product_description: str = "", brand_tone: str = "") -> List[dict]:
        """Suggest tailored personas based on product name and description."""
        return []


class ResilientAIProvider(BaseAIProvider):
    """
    Wraps a primary AI provider with transparent runtime fallback to MockProvider
    on timeouts, rate limits, API errors, or outages without dropping user data.
    """

    def __init__(self, primary: BaseAIProvider, fallback: BaseAIProvider, fallback_enabled: bool = True):
        self.primary = primary
        self.fallback = fallback
        self.fallback_enabled = fallback_enabled

    def _call_resilient(self, method_name: str, *args, **kwargs):
        try:
            method = getattr(self.primary, method_name)
            return method(*args, **kwargs)
        except Exception as e:
            if self.fallback_enabled:
                logger.warning(
                    "Primary AI provider %s failed in %s: %s. Gracefully engaging fallback provider %s.",
                    type(self.primary).__name__,
                    method_name,
                    e,
                    type(self.fallback).__name__,
                )
                fallback_method = getattr(self.fallback, method_name)
                return fallback_method(*args, **kwargs)
            raise

    def generate_persona_dna(self, brand_kit: dict, persona: dict) -> dict:
        return self._call_resilient("generate_persona_dna", brand_kit, persona)

    def generate_campaign_concepts(self, brand_kit: dict, persona_dna: dict) -> List[dict]:
        return self._call_resilient("generate_campaign_concepts", brand_kit, persona_dna)

    def generate_social_post(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        return self._call_resilient("generate_social_post", brand_kit, persona, concept)

    def generate_email(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        return self._call_resilient("generate_email", brand_kit, persona, concept)

    def evaluate_brand_fit(self, content: str, brand_kit: dict, persona: dict, channel: str) -> dict:
        return self._call_resilient("evaluate_brand_fit", content, brand_kit, persona, channel)

    def generate_explanation(self, content: dict, brand_kit: dict, persona: dict, concept: dict, channel: str) -> dict:
        return self._call_resilient("generate_explanation", content, brand_kit, persona, concept, channel)

    def auto_fix_content(self, channel_type: str, current_content: dict, violations: List[str], brand_kit: dict, persona: dict, concept: dict) -> dict:
        return self._call_resilient("auto_fix_content", channel_type, current_content, violations, brand_kit, persona, concept)

    def suggest_personas(self, product_name: str, product_description: str = "", brand_tone: str = "") -> List[dict]:
        return self._call_resilient("suggest_personas", product_name, product_description, brand_tone)


def get_ai_provider(config: Optional[dict] = None) -> BaseAIProvider:
    """
    Factory function returning the configured AI provider.
    Supports runtime fallback to MockProvider when real providers fail or lack keys.
    """
    from flask import current_app

    if config is None:
        try:
            provider_name = current_app.config.get("AI_PROVIDER", "mock").lower()
            fallback_enabled = current_app.config.get("AI_FALLBACK_ENABLED", True)
            gemini_key = current_app.config.get("GEMINI_API_KEY", "")
            grok_key = current_app.config.get("GROK_API_KEY", "")
        except RuntimeError:
            provider_name = os.environ.get("AI_PROVIDER", "mock").lower()
            fallback_enabled = os.environ.get("AI_FALLBACK_ENABLED", "true").lower() == "true"
            gemini_key = os.environ.get("GEMINI_API_KEY", "")
            grok_key = os.environ.get("GROK_API_KEY", "")
    else:
        provider_name = str(config.get("AI_PROVIDER", "mock")).lower()
        fallback_enabled = bool(config.get("AI_FALLBACK_ENABLED", True))
        gemini_key = str(config.get("GEMINI_API_KEY", ""))
        grok_key = str(config.get("GROK_API_KEY", ""))

    from .mock_provider import MockProvider
    mock = MockProvider()

    if provider_name == "gemini":
        if not gemini_key:
            if fallback_enabled:
                logger.warning("GEMINI_API_KEY not configured. Falling back to MockProvider.")
                return mock
            raise ValueError("GEMINI_API_KEY is not configured and AI fallback is disabled.")
        try:
            from .gemini_provider import GeminiProvider
            gemini = GeminiProvider(api_key=gemini_key)
            if fallback_enabled:
                return ResilientAIProvider(primary=gemini, fallback=mock, fallback_enabled=True)
            return gemini
        except Exception as e:
            if fallback_enabled:
                logger.warning("Failed to initialize GeminiProvider: %s. Falling back to MockProvider.", e)
                return mock
            raise

    elif provider_name == "grok":
        if not grok_key:
            if fallback_enabled:
                logger.warning("GROK_API_KEY not configured. Falling back to MockProvider.")
                return mock
            raise ValueError("GROK_API_KEY is not configured and AI fallback is disabled.")
        try:
            from .grok_provider import GrokProvider
            grok = GrokProvider(api_key=grok_key)
            if fallback_enabled:
                return ResilientAIProvider(primary=grok, fallback=mock, fallback_enabled=True)
            return grok
        except Exception as e:
            if fallback_enabled:
                logger.warning("Failed to initialize GrokProvider: %s. Falling back to MockProvider.", e)
                return mock
            raise

    return mock
