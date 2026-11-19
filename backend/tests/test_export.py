"""Tests for Campaign Explainability & Multi-Format Export (US5)."""
import json
import pytest
from app.services.export_service import generate_markdown_export, generate_json_export


@pytest.fixture
def sample_campaign_bundle(sample_brand_kit, sample_persona):
    return {
        "id": "test-campaign-12345",
        "brand_kit": sample_brand_kit,
        "persona": sample_persona,
        "concept": {
            "title": "The Proactive Shield",
            "angle": "Autonomous Threat Defense",
            "hook": "Zero trust, zero breach.",
        },
        "social_post": {
            "content": {"text": "Zero-trust cybersecurity that never sleeps.", "character_count": 42},
            "validation_report": {"overall_score": 94, "passed": True},
            "why_this_content": {
                "persona_rationale": "Appeals to CISO risk reduction.",
                "brand_rationale": "Reflects authoritative tone.",
                "channel_rationale": "High-impact opening hook.",
            },
        },
        "email": {
            "content": {
                "subject": "CyberShield: Modernize your defenses",
                "body": "Detailed executive briefing on autonomous cybersecurity resilience.",
                "word_count": 85,
            },
            "validation_report": {"overall_score": 92, "passed": True},
            "why_this_content": {
                "persona_rationale": "Provides enterprise risk metrics.",
                "brand_rationale": "Maintains professional posture.",
                "channel_rationale": "Clear call to action for demo.",
            },
        },
    }


class TestExportService:
    def test_generate_markdown_export(self, sample_campaign_bundle):
        md = generate_markdown_export(sample_campaign_bundle)
        assert isinstance(md, str)
        assert "# CampaignGuard AI — Marketing Campaign Export" in md
        assert "CyberShield" in md
        assert "Enterprise CISO" in md
        assert "The Proactive Shield" in md
        assert "Social Media Post" in md
        assert "Marketing Email" in md
        assert "Brand Guardian Score" in md
        assert "Why This Content?" in md

    def test_generate_json_export(self, sample_campaign_bundle):
        json_str = generate_json_export(sample_campaign_bundle)
        assert isinstance(json_str, str)
        parsed = json.loads(json_str)
        assert "export_metadata" in parsed
        assert "campaign" in parsed
        assert parsed["export_metadata"]["campaign_id"] == "test-campaign-12345"
        assert parsed["campaign"]["brand_kit"]["product_name"] == "CyberShield"


class TestExportEndpoint:
    def test_export_endpoint_markdown(self, client, sample_brand_kit, sample_persona):
        # First generate assets to create a campaign in storage
        concept = {"title": "Shield", "angle": "Defense", "hook": "Protect"}
        gen_resp = client.post(
            "/api/campaigns/generate-assets",
            json={
                "brand_kit": sample_brand_kit,
                "persona": sample_persona,
                "selected_concept": concept,
            },
        )
        assert gen_resp.status_code == 200
        camp_id = gen_resp.get_json()["id"]

        # Request markdown export
        exp_resp = client.get(f"/api/campaigns/export/{camp_id}?format=markdown")
        assert exp_resp.status_code == 200
        assert "text/markdown" in exp_resp.content_type
        assert b"CampaignGuard AI" in exp_resp.data

    def test_export_endpoint_json(self, client, sample_brand_kit, sample_persona):
        concept = {"title": "Shield", "angle": "Defense", "hook": "Protect"}
        gen_resp = client.post(
            "/api/campaigns/generate-assets",
            json={
                "brand_kit": sample_brand_kit,
                "persona": sample_persona,
                "selected_concept": concept,
            },
        )
        camp_id = gen_resp.get_json()["id"]

        # Request json export
        exp_resp = client.get(f"/api/campaigns/export/{camp_id}?format=json")
        assert exp_resp.status_code == 200
        assert "application/json" in exp_resp.content_type
        data = exp_resp.get_json()
        assert "export_metadata" in data
        assert "campaign" in data

    def test_export_nonexistent_campaign_returns_404(self, client):
        resp = client.get("/api/campaigns/export/nonexistent-id-999")
        assert resp.status_code == 404
