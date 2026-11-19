"""Tests for Multi-Persona Differentiation & Audience Strategy (US2)."""
import pytest
from app.services.mock_provider import MockProvider


class TestMultiPersonaDifferentiation:
    def test_contrasting_personas_generate_distinct_dna(self, sample_brand_kit):
        provider = MockProvider()

        ciso_persona = {
            "persona_name": "Enterprise CISO",
            "primary_goals": "Zero-breach risk, audit readiness",
            "pain_points": "Alert fatigue, board scrutiny",
            "core_motivations": "Asset protection, enterprise stability",
            "emotional_triggers": "Breach anxiety",
            "preferred_message_style": "Data-driven, formal",
        }

        wellness_persona = {
            "persona_name": "Mindful Wellness Enthusiast",
            "primary_goals": "Natural vitality, adrenal balance",
            "pain_points": "Midday crash, synthetic jitters",
            "core_motivations": "Living in physical alignment",
            "emotional_triggers": "Stress, fatigue",
            "preferred_message_style": "Warm, inspiring, organic",
        }

        ciso_dna = provider.generate_persona_dna(sample_brand_kit, ciso_persona)
        wellness_dna = provider.generate_persona_dna(sample_brand_kit, wellness_persona)

        # Primary hooks must be distinctly differentiated
        assert ciso_dna["primary_hook"] != wellness_dna["primary_hook"]
        assert "compliance" in ciso_dna["tone_vector"].lower() or "authoritative" in ciso_dna["tone_vector"].lower()
        assert "wellness" in wellness_dna["tone_vector"].lower() or "uplifting" in wellness_dna["tone_vector"].lower()

        # Psychological drivers must have distinct themes
        ciso_drivers = " ".join(ciso_dna["psychological_drivers"]).lower()
        wellness_drivers = " ".join(wellness_dna["psychological_drivers"]).lower()
        assert "risk" in ciso_drivers or "audit" in ciso_drivers
        assert "vitality" in wellness_drivers or "balance" in wellness_drivers or "energy" in wellness_drivers

        # Differentiation strategies must be different
        assert ciso_dna["differentiation_strategy"] != wellness_dna["differentiation_strategy"]

    def test_concepts_vary_by_persona_context(self, sample_brand_kit):
        provider = MockProvider()

        dna_tech = {"persona_name": "Enterprise CISO", "core_value_angle": "Security"}
        dna_consumer = {"persona_name": "Mindful Consumer", "core_value_angle": "Vitality"}

        concepts_tech = provider.generate_campaign_concepts(sample_brand_kit, dna_tech)
        concepts_consumer = provider.generate_campaign_concepts(sample_brand_kit, dna_consumer)

        assert len(concepts_tech) >= 3
        assert len(concepts_consumer) >= 3

        # Rationale and angles must mention the specific persona target
        assert "ciso" in concepts_tech[0]["rationale"].lower() or "ciso" in concepts_tech[0]["angle"].lower()
        assert "consumer" in concepts_consumer[0]["rationale"].lower() or "consumer" in concepts_consumer[0]["angle"].lower()
