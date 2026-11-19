"""Tests for AI-guided Auto-Fix, retry bounds, and Brand Guardian revalidation (US3)."""
import pytest
from app.services.brand_guardian import run_brand_guardian
from app.services.mock_provider import MockProvider


class TestBrandGuardianDimensionsAndScoring:
    def test_compliant_content_passes_with_high_score(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield", "hook": "Defend"}
        compliant_post = {"text": "Zero-trust architecture protects enterprise systems with continuous compliance."}

        report = run_brand_guardian("social_post", compliant_post, sample_brand_kit, sample_persona, concept, provider)
        assert report["passed"] is True
        assert report["overall_score"] >= 85
        assert len(report["dimensions"]) == 6

        # Check all dimensions pass
        dim_map = {d["dimension"]: d for d in report["dimensions"]}
        assert dim_map["Banned Words Check"]["passed"] is True
        assert dim_map["Rule Compliance"]["passed"] is True
        assert dim_map["Length Validation"]["passed"] is True

    def test_banned_words_dock_score_below_70_and_fail(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield", "hook": "Defend"}
        # "cheap" is in sample_brand_kit["banned_words"]
        bad_post = {"text": "This is a cheap cybersecurity tool for your enterprise."}

        report = run_brand_guardian("social_post", bad_post, sample_brand_kit, sample_persona, concept, provider)
        assert report["passed"] is False
        assert report["overall_score"] < 70

        dim_map = {d["dimension"]: d for d in report["dimensions"]}
        assert dim_map["Banned Words Check"]["passed"] is False
        assert dim_map["Banned Words Check"]["score"] == 0
        assert len(dim_map["Banned Words Check"]["violations"]) > 0

    def test_length_overrun_fails_length_dimension(self, sample_brand_kit, sample_persona):
        provider = MockProvider()
        concept = {"title": "Shield", "hook": "Defend"}
        overrun_post = {"text": "A" * 285}

        report = run_brand_guardian("social_post", overrun_post, sample_brand_kit, sample_persona, concept, provider)
        assert report["passed"] is False

        dim_map = {d["dimension"]: d for d in report["dimensions"]}
        assert dim_map["Length Validation"]["passed"] is False
        assert dim_map["Length Validation"]["score"] == 0


class TestAutoFixEndpoint:
    def test_auto_fix_removes_banned_word_and_restores_score(self, client, sample_brand_kit, sample_persona):
        concept = {"id": "c1", "title": "Cyber Shield", "hook": "Defend all assets."}
        violating_post = {
            "text": "Get this cheap and basic security product today for instant protection."
        }

        resp = client.post(
            "/api/campaigns/auto-fix",
            json={
                "channel_type": "social_post",
                "current_content": violating_post,
                "violations": ["Banned word: cheap", "Banned word: basic"],
                "brand_kit": sample_brand_kit,
                "persona": sample_persona,
                "concept": concept,
                "max_attempts": 2,
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "success"

        fixed_content = data["remediated_content"]
        assert "cheap" not in fixed_content["text"].lower()
        assert "basic" not in fixed_content["text"].lower()
        assert len(fixed_content["text"]) <= 280

        # Verification that Brand Guardian was re-run
        final_report = data["validation_report"]
        assert final_report["passed"] is True
        assert final_report["overall_score"] >= 85

    def test_auto_fix_enforces_max_two_attempts(self, client, sample_brand_kit, sample_persona):
        concept = {"id": "c1", "title": "Cyber Shield", "hook": "Defend all assets."}
        post = {"text": "A clean compliant message with no violations."}

        # Request with max_attempts: 5 must be capped to at most 2
        resp = client.post(
            "/api/campaigns/auto-fix",
            json={
                "channel_type": "social_post",
                "current_content": post,
                "brand_kit": sample_brand_kit,
                "persona": sample_persona,
                "concept": concept,
                "max_attempts": 5,
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["attempts"] <= 2

    def test_auto_fix_missing_required_fields_returns_400(self, client):
        resp = client.post("/api/campaigns/auto-fix", json={"channel_type": "social_post"})
        assert resp.status_code == 400
