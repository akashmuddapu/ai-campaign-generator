import pytest
import json
from pathlib import Path
from app.services.report_card_service import (
    calculate_grade,
    calculate_launch_readiness,
    synthesize_report_card,
)


def test_calculate_grade_ranges():
    assert calculate_grade(98) == "A+"
    assert calculate_grade(95) == "A+"
    assert calculate_grade(92) == "A"
    assert calculate_grade(85) == "B"
    assert calculate_grade(75) == "C"
    assert calculate_grade(65) == "D"


def test_calculate_launch_readiness():
    assert calculate_launch_readiness(95, has_violations=False) == "Ready to Launch"
    assert calculate_launch_readiness(78, has_violations=False) == "Launch with Improvements"
    assert calculate_launch_readiness(65, has_violations=False) == "Needs Revision"
    assert calculate_launch_readiness(95, has_violations=True) == "Needs Revision"


def test_synthesize_report_card_from_campaign():
    sample_campaign = {
        "id": "camp-test-123",
        "brand_kit": {"product_name": "TestProduct", "brand_tone": "innovative"},
        "persona": {"persona_name": "Innovator", "emotional_triggers": "Desire for edge"},
        "concept": {"title": "The Next Frontier", "hook": "Leap forward"},
        "assets": {
            "social_post": {
                "content": {"text": "Exciting new announcement!"},
                "validation_report": {
                    "overall_score": 95,
                    "dimensions": [
                        {"dimension": "Brand Fit", "score": 96, "passed": True},
                        {"dimension": "Persona Fit", "score": 94, "passed": True},
                        {"dimension": "Channel Fit", "score": 92, "passed": True},
                        {"dimension": "Rule Compliance", "score": 100, "passed": True, "violations": []},
                    ],
                },
            },
            "email": {
                "content": {"subject": "Future is here", "body": "Hello world."},
                "validation_report": {
                    "overall_score": 94,
                    "dimensions": [
                        {"dimension": "Brand Fit", "score": 95, "passed": True},
                        {"dimension": "Persona Fit", "score": 96, "passed": True},
                        {"dimension": "Channel Fit", "score": 90, "passed": True},
                        {"dimension": "Rule Compliance", "score": 100, "passed": True, "violations": []},
                    ],
                },
            },
        },
    }

    rc = synthesize_report_card(sample_campaign)
    assert rc.campaign_id == "camp-test-123"
    assert rc.overall_score >= 90
    assert rc.grade in ["A", "A+"]
    assert rc.launch_readiness == "Ready to Launch"
    assert rc.score_breakdown.brand_consistency >= 90
    assert rc.score_breakdown.persona_relevance >= 90
    assert len(rc.persona_impacts) >= 1
    assert rc.persona_impacts[0].persona_name == "Innovator"
    assert rc.predicted_performance.linkedin_engagement_rate != ""
    assert len(rc.ai_insights.top_strengths) >= 1


def test_report_card_api_endpoint(client, app):
    # Seed a campaign into DATA_DIR/campaigns.json
    campaign_id = "camp-api-test-001"
    camp_data = {
        "id": campaign_id,
        "bundle": {
            "id": campaign_id,
            "brand_kit": {"product_name": "CloudGuard"},
            "persona": {"persona_name": "CTO"},
            "concept": {"title": "Cloud Scale"},
            "assets": {
                "social_post": {
                    "content": {"text": "Scale fearlessly."},
                    "validation_report": {
                        "overall_score": 96,
                        "dimensions": [
                            {"dimension": "Brand Fit", "score": 96, "passed": True},
                            {"dimension": "Persona Fit", "score": 98, "passed": True},
                            {"dimension": "Rule Compliance", "score": 100, "passed": True, "violations": []},
                        ],
                    },
                }
            },
        },
    }

    c_path = Path(app.config["DATA_DIR"]) / "campaigns.json"
    c_path.write_text(json.dumps([camp_data]))

    res = client.get(f"/api/campaigns/{campaign_id}/report-card")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["grade"] in ["A", "A+"]
    assert data["data"]["overall_score"] >= 90
    assert data["data"]["brand_kit_alignment"]["product_name"] == "CloudGuard"


def test_report_card_aligns_with_brand_kit_and_all_personas(client):
    payload = {
        "id": "live-cyber-1",
        "brand_kit": {
            "product_name": "CyberShield Cloud",
            "tagline": "Zero Trust. Zero Breach.",
            "brand_tone": "Authoritative, Precise, Trustworthy",
            "banned_words": ["cheap", "guaranteed", "hack-proof"],
        },
        "persona": {"persona_name": "Enterprise CISO", "emotional_triggers": "Board-level risk mitigation"},
        "all_personas": [
            {"persona_name": "Enterprise CISO", "emotional_triggers": "Board-level risk mitigation"},
            {"persona_name": "VP of Cloud Engineering", "core_motivations": "Zero-latency DevSecOps pipelines"},
            {"persona_name": "Compliance Officer", "primary_goals": "Audit readiness across SOC2 and ISO"},
        ],
        "concept": {"title": "Zero-Trust Precision", "hook": "Stop breaches before they begin."},
        "assets": {
            "social_post": {
                "content": {
                    "text": "CyberShield Cloud delivers Zero Trust security for Enterprise CISO teams with precise audit readiness."
                }
            },
            "email": {
                "content": {
                    "subject": "CyberShield Cloud: Zero Trust for your team",
                    "body": " ".join(["CyberShield Cloud empowers cloud engineering and compliance teams with authoritative precision."] * 10),
                }
            },
        },
    }

    res = client.post("/api/campaigns/report-card/evaluate", json=payload)
    assert res.status_code == 200
    rc = res.get_json()["data"]
    alignment = rc["brand_kit_alignment"]
    assert alignment["product_name"] == "CyberShield Cloud"
    assert alignment["tagline"] == "Zero Trust. Zero Breach."
    assert alignment["brand_tones"] == ["Authoritative", "Precise", "Trustworthy"]
    assert alignment["flagged_banned_words"] == []
    assert alignment["product_mentioned"] is True
    assert len(rc["persona_impacts"]) == 3
    names = [p["persona_name"] for p in rc["persona_impacts"]]
    assert "Enterprise CISO" in names
    assert "VP of Cloud Engineering" in names
    assert "Compliance Officer" in names

    # Now introduce a Brand Kit banned word and verify it drops score & flags the exact word
    payload["assets"]["social_post"]["content"]["text"] = "Get cheap guaranteed protection with CyberShield Cloud!"
    res_bad = client.post("/api/campaigns/report-card/evaluate", json=payload)
    assert res_bad.status_code == 200
    rc_bad = res_bad.get_json()["data"]
    assert rc_bad["launch_readiness"] == "Needs Revision"
    assert rc_bad["overall_score"] <= 68
    assert "cheap" in rc_bad["brand_kit_alignment"]["flagged_banned_words"]
    assert "guaranteed" in rc_bad["brand_kit_alignment"]["flagged_banned_words"]
