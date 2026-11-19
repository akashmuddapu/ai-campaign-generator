"""Tests for AI provider abstraction, MockProvider, Gemini/Grok providers, and fallback behavior."""
import pytest
from unittest.mock import patch, MagicMock
from app.services.ai_service import BaseAIProvider, get_ai_provider
from app.services.mock_provider import MockProvider
from app.services.gemini_provider import GeminiProvider
from app.services.grok_provider import GrokProvider


class TestMockProvider:
    def test_mock_provider_implements_interface(self):
        provider = MockProvider()
        assert isinstance(provider, BaseAIProvider)

    def test_generate_persona_dna(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        dna = provider.generate_persona_dna(sample_brand_kit, sample_persona)
        assert isinstance(dna, dict)
        assert "persona_name" in dna
        assert "audience_summary" in dna
        assert "core_value_angle" in dna
        assert "tone_vector" in dna
        assert "primary_hook" in dna
        assert "psychological_drivers" in dna
        assert "differentiation_strategy" in dna
        assert isinstance(dna["psychological_drivers"], list)

    def test_generate_campaign_concepts(self, sample_brand_kit):
        provider = MockProvider()
        fake_dna = {"persona_name": "CISO", "core_value_angle": "Security", "tone_vector": "Formal"}
        concepts = provider.generate_campaign_concepts(sample_brand_kit, fake_dna)
        assert isinstance(concepts, list)
        assert len(concepts) >= 3
        for c in concepts:
            assert "id" in c
            assert "title" in c
            assert "angle" in c
            assert "hook" in c
            assert "tone" in c
            assert "rationale" in c

    def test_generate_social_post_meets_length_and_no_banned(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield", "hook": "Protect everything now with zero friction."}
        post = provider.generate_social_post(sample_brand_kit, sample_persona, concept)
        assert isinstance(post, dict)
        assert "text" in post
        assert len(post["text"]) <= 280
        # Should not contain sample banned words
        for bw in sample_brand_kit["banned_words"]:
            assert bw.lower() not in post["text"].lower()

    def test_generate_email_meets_length_and_word_count(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield", "hook": "Protect everything"}
        email = provider.generate_email(sample_brand_kit, sample_persona, concept)
        assert isinstance(email, dict)
        assert "subject" in email
        assert "body" in email
        assert len(email["subject"]) <= 60
        word_count = len(email["body"].split())
        assert 75 <= word_count <= 250
        for bw in sample_brand_kit["banned_words"]:
            assert bw.lower() not in email["subject"].lower()
            assert bw.lower() not in email["body"].lower()

    def test_evaluate_brand_fit(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        res = provider.evaluate_brand_fit("Good content", sample_brand_kit, sample_persona, "social_post")
        assert "brand_fit_score" in res
        assert "persona_fit_score" in res
        assert "channel_fit_score" in res
        assert res["passed"] is True

    def test_generate_explanation(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield"}
        exp = provider.generate_explanation({}, sample_brand_kit, sample_persona, concept, "social_post")
        assert "persona_rationale" in exp
        assert "brand_rationale" in exp
        assert "channel_rationale" in exp
        assert "angle_explanation" in exp
        assert "audience_impact" in exp

    def test_auto_fix_social_post(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield"}
        bad_post = {"text": "This is a cheap tool that is very easy and basic."}
        fixed = provider.auto_fix_content(
            "social_post", bad_post, ["Banned word: cheap"], sample_brand_kit, sample_persona, concept
        )
        assert "cheap" not in fixed["text"].lower()
        assert "easy" not in fixed["text"].lower()
        assert "basic" not in fixed["text"].lower()
        assert len(fixed["text"]) <= 280


class TestAIProviderFactoryAndFallback:
    def test_factory_returns_mock_when_configured(self):
        config = {"AI_PROVIDER": "mock", "AI_FALLBACK_ENABLED": True}
        provider = get_ai_provider(config)
        assert isinstance(provider, MockProvider)

    def test_factory_fallback_when_gemini_key_missing(self):
        config = {"AI_PROVIDER": "gemini", "GEMINI_API_KEY": "", "AI_FALLBACK_ENABLED": True}
        provider = get_ai_provider(config)
        assert isinstance(provider, MockProvider)

    def test_factory_error_when_gemini_key_missing_and_fallback_disabled(self):
        config = {"AI_PROVIDER": "gemini", "GEMINI_API_KEY": "", "AI_FALLBACK_ENABLED": False}
        with pytest.raises(ValueError, match="GEMINI_API_KEY is not configured"):
            get_ai_provider(config)

    def test_factory_fallback_when_grok_key_missing(self):
        config = {"AI_PROVIDER": "grok", "GROK_API_KEY": "", "AI_FALLBACK_ENABLED": True}
        provider = get_ai_provider(config)
        assert isinstance(provider, MockProvider)

    def test_factory_error_when_grok_key_missing_and_fallback_disabled(self):
        config = {"AI_PROVIDER": "grok", "GROK_API_KEY": "", "AI_FALLBACK_ENABLED": False}
        with pytest.raises(ValueError, match="GROK_API_KEY is not configured"):
            get_ai_provider(config)

    def test_factory_instantiates_gemini_provider(self):
        config = {"AI_PROVIDER": "gemini", "GEMINI_API_KEY": "fake-gemini-key", "AI_FALLBACK_ENABLED": False}
        provider = get_ai_provider(config)
        assert isinstance(provider, GeminiProvider)

    def test_factory_instantiates_grok_provider(self):
        config = {"AI_PROVIDER": "grok", "GROK_API_KEY": "fake-grok-key", "AI_FALLBACK_ENABLED": False}
        provider = get_ai_provider(config)
        assert isinstance(provider, GrokProvider)


class TestExternalProvidersWithMocks:
    @patch.object(GeminiProvider, "_call_gemini")
    def test_gemini_provider_generate_persona_dna(self, mock_call, sample_brand_kit, sample_persona):
        mock_call.return_value = '{"persona_name": "Enterprise CISO", "audience_summary": "Risk-focused executive", "core_value_angle": "Governance", "tone_vector": "Formal", "primary_hook": "Secure the enterprise", "psychological_drivers": ["Security"], "differentiation_strategy": "Zero trust"}'
        provider = GeminiProvider(api_key="mock-key")
        res = provider.generate_persona_dna(sample_brand_kit, sample_persona)
        assert res["persona_name"] == "Enterprise CISO"
        assert res["core_value_angle"] == "Governance"

    @patch.object(GrokProvider, "_call_grok")
    def test_grok_provider_generate_persona_dna(self, mock_call, sample_brand_kit, sample_persona):
        mock_call.return_value = '{"persona_name": "Startup CTO", "audience_summary": "Speed-focused founder", "core_value_angle": "Velocity", "tone_vector": "Pragmatic", "primary_hook": "Deploy with speed", "psychological_drivers": ["Agility"], "differentiation_strategy": "DevSecOps"}'
        provider = GrokProvider(api_key="mock-key")
        res = provider.generate_persona_dna(sample_brand_kit, sample_persona)
        assert res["persona_name"] == "Startup CTO"
        assert res["core_value_angle"] == "Velocity"
