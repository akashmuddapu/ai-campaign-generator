"""End-to-end Campaign Generation Journey Tests (US1)."""
import pytest
import json


class TestPresetsEndpoint:
    def test_get_presets_returns_b2b_and_b2c(self, client):
        resp = client.get("/api/presets")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("status") == "success"
        presets = data.get("presets", [])
        assert len(presets) >= 2

        categories = [p.get("category") for p in presets]
        assert "B2B Tech" in categories
        assert "B2C Consumer" in categories

        # Validate structure of CyberShield preset
        b2b = next(p for p in presets if p.get("category") == "B2B Tech")
        assert "brand_kit" in b2b
        assert "personas" in b2b
        assert len(b2b["personas"]) >= 2
        assert "banned_words" in b2b["brand_kit"]


class TestCampaignFlowEndpoints:
    def test_persona_dna_validation(self, client, sample_brand_kit, sample_persona):
        # Missing fields should return 400
        resp = client.post("/api/campaigns/persona-dna", json={})
        assert resp.status_code == 400

        # Valid input returns 200
        resp = client.post(
            "/api/campaigns/persona-dna",
            json={"brand_kit": sample_brand_kit, "persona": sample_persona},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("status") == "success"
        dna = data.get("persona_dna")
        assert dna["persona_name"] == sample_persona["persona_name"]
        assert "core_value_angle" in dna
        assert "psychological_drivers" in dna

    def test_concepts_generation(self, client, sample_brand_kit):
        fake_dna = {
            "persona_name": "Enterprise CISO",
            "core_value_angle": "Autonomous resilience",
            "tone_vector": "Authoritative",
            "primary_hook": "Stop reacting to breaches.",
            "psychological_drivers": ["Security", "Control"],
        }

        # Missing input returns 400
        resp = client.post("/api/campaigns/concepts", json={})
        assert resp.status_code == 400

        # Valid input returns >= 3 concepts
        resp = client.post(
            "/api/campaigns/concepts",
            json={"brand_kit": sample_brand_kit, "persona_dna": fake_dna},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("status") == "success"
        concepts = data.get("concepts", [])
        assert len(concepts) >= 3
        for c in concepts:
            assert "id" in c
            assert "title" in c
            assert "angle" in c
            assert "hook" in c
            assert "tone" in c

    def test_generate_assets_full_journey(self, client, sample_brand_kit, sample_persona):
        concept = {
            "id": "c-1",
            "title": "The Proactive Shield",
            "angle": "Autonomous Threat Defense",
            "hook": "Zero trust, zero breach.",
            "tone": "Authoritative",
            "rationale": "Enterprise protection",
        }

        # Missing required parameter returns 400
        resp = client.post("/api/campaigns/generate-assets", json={"brand_kit": sample_brand_kit})
        assert resp.status_code == 400

        # Generate assets using selected_concept
        resp = client.post(
            "/api/campaigns/generate-assets",
            json={
                "brand_kit": sample_brand_kit,
                "persona": sample_persona,
                "selected_concept": concept,
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("status") == "success"
        assert "id" in data
        assert "assets" in data

        assets = data["assets"]
        assert "social_post" in assets
        assert "email" in assets

        # Check social post
        sp = assets["social_post"]
        assert "content" in sp
        assert "validation_report" in sp
        assert "why_this_content" in sp
        assert len(sp["content"]["text"]) <= 280

        # Check email
        em = assets["email"]
        assert "content" in em
        assert "validation_report" in em
        assert "why_this_content" in em
        assert len(em["content"]["subject"]) <= 60
        assert 75 <= len(em["content"]["body"].split()) <= 250

        # Check Brand Guardian report structure
        vr = sp["validation_report"]
        assert "overall_score" in vr
        assert "passed" in vr
        assert "dimensions" in vr
        assert len(vr["dimensions"]) == 6

        # Check Explainability structure
        why = sp["why_this_content"]
        assert "persona_rationale" in why
        assert "brand_rationale" in why
        assert "channel_rationale" in why

        # Test listing campaigns history
        list_resp = client.get("/api/campaigns")
        assert list_resp.status_code == 200
        list_data = list_resp.get_json()
        assert list_data.get("status") == "success"
        campaigns_list = list_data.get("campaigns", [])
        assert len(campaigns_list) >= 1
        assert any(c["id"] == data["id"] for c in campaigns_list)

        # Test get specific campaign detail
        detail_resp = client.get(f"/api/campaigns/{data['id']}")
        assert detail_resp.status_code == 200
        detail_data = detail_resp.get_json()
        assert detail_data.get("status") == "success"
        assert detail_data.get("campaign")["id"] == data["id"]
