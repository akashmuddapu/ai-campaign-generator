"""Campaign routes — persona DNA, concepts, asset generation, Brand Guardian, auto-fix, and export."""
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
from flask import Blueprint, request, session, jsonify, current_app

from ..services.ai_service import get_ai_provider
from ..services import storage_service
from ..services.brand_guardian import run_brand_guardian
from ..services.export_service import generate_markdown_export, generate_json_export

campaign_bp = Blueprint("campaign", __name__)


def _get_provider():
    return get_ai_provider()


@campaign_bp.post("/suggest-personas")
def suggest_personas():
    data = request.get_json(silent=True) or {}
    product_name = data.get("product_name", "").strip()
    product_description = data.get("product_description", "").strip()
    brand_tone = data.get("brand_tone", "").strip()

    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    provider = _get_provider()
    try:
        personas = provider.suggest_personas(product_name, product_description, brand_tone)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"status": "success", "personas": personas}), 200


@campaign_bp.post("/persona-dna")
def persona_dna():
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit")
    persona = data.get("persona")
    if not brand_kit or not persona:
        return jsonify({"error": "brand_kit and persona are required"}), 400

    provider = _get_provider()
    try:
        result = provider.generate_persona_dna(brand_kit, persona)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"status": "success", "persona_dna": result}), 200


@campaign_bp.post("/concepts")
def concepts():
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit")
    persona_dna = data.get("persona_dna")
    if not brand_kit or not persona_dna:
        return jsonify({"error": "brand_kit and persona_dna are required"}), 400

    provider = _get_provider()
    try:
        result = provider.generate_campaign_concepts(brand_kit, persona_dna)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"status": "success", "concepts": result}), 200


@campaign_bp.post("/generate-assets")
def generate_assets():
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit")
    persona = data.get("persona")
    concept = data.get("selected_concept") or data.get("concept")

    if not brand_kit or not persona or not concept:
        return jsonify({"error": "brand_kit, persona, and concept are required"}), 400

    provider = _get_provider()

    try:
        social_post = provider.generate_social_post(brand_kit, persona, concept)
        email = provider.generate_email(brand_kit, persona, concept)

        # Brand Guardian validation
        social_report = run_brand_guardian("social_post", social_post, brand_kit, persona, concept, provider)
        email_report = run_brand_guardian("email", email, brand_kit, persona, concept, provider)

        # Why This Content
        social_why = provider.generate_explanation(social_post, brand_kit, persona, concept, "social_post")
        email_why = provider.generate_explanation(email, brand_kit, persona, concept, "email")

        campaign_id = str(uuid.uuid4())

        assets_payload = {
            "social_post": {
                "content": social_post,
                "validation_report": social_report,
                "why_this_content": social_why,
            },
            "email": {
                "content": email,
                "validation_report": email_report,
                "why_this_content": email_why,
            },
        }

        user_id = data.get("user_id") or request.headers.get("X-User-Id") or session.get("user_id")
        created_at = datetime.now(timezone.utc).isoformat()
        all_personas = data.get("all_personas")
        assets_by_persona = data.get("assets_by_persona") or {}

        bundle_record = {
            "id": campaign_id,
            "user_id": str(user_id) if user_id is not None else None,
            "created_at": created_at,
            "status": "success",
            "assets": assets_payload,
            "brand_kit": brand_kit,
            "persona": persona,
            "all_personas": all_personas if all_personas else [persona],
            "assets_by_persona": assets_by_persona,
            "concept": concept,
            "social_post": assets_payload["social_post"],
            "email": assets_payload["email"],
        }

        # Store for export and dashboard
        campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
        campaigns = storage_service.read_json(campaigns_path, default=[])
        campaigns.append({
            "id": campaign_id,
            "user_id": str(user_id) if user_id is not None else None,
            "created_at": created_at,
            "bundle": bundle_record
        })
        storage_service.write_json(campaigns_path, campaigns)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(bundle_record), 200


@campaign_bp.post("/auto-fix")
def auto_fix():
    data = request.get_json(silent=True) or {}
    channel_type = data.get("channel_type")
    content = data.get("current_content") or data.get("content")
    brand_kit = data.get("brand_kit")
    persona = data.get("persona")
    concept = data.get("concept") or data.get("selected_concept")
    max_attempts = min(int(data.get("max_attempts", 2)), 2)

    if not all([channel_type, content, brand_kit, persona, concept]):
        return jsonify({"error": "channel_type, content, brand_kit, persona, and concept are required"}), 400

    provider = _get_provider()
    current_content = dict(content)
    attempts = 0
    final_report = None

    for _ in range(max_attempts):
        report = run_brand_guardian(channel_type, current_content, brand_kit, persona, concept, provider)
        final_report = report
        attempts += 1

        if report.get("passed", False):
            break

        violations = []
        for dim in report.get("dimensions", []):
            violations.extend(dim.get("violations", []))

        if not violations:
            break

        try:
            current_content = provider.auto_fix_content(
                channel_type, current_content, violations, brand_kit, persona, concept
            )
        except Exception:
            break

    # Re-validate remediated content
    final_report = run_brand_guardian(channel_type, current_content, brand_kit, persona, concept, provider)
    why_this = provider.generate_explanation(current_content, brand_kit, persona, concept, channel_type)

    return jsonify({
        "status": "success",
        "remediated_content": current_content,
        "content": current_content,
        "validation_report": final_report,
        "why_this_content": why_this,
        "attempts": attempts,
    }), 200


@campaign_bp.get("")
def list_campaigns():
    user_id = session.get("user_id") or request.headers.get("X-User-Id") or request.args.get("user_id")
    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])

    summaries = []
    for item in campaigns:
        b = item.get("bundle", item)
        c_user = b.get("user_id") or item.get("user_id")
        bk = b.get("brand_kit", {})
        concept = b.get("concept", {}) or b.get("selected_concept", {})
        persona = b.get("persona", {})
        social = b.get("social_post", {})
        vr = social.get("validation_report", {})
        score = vr.get("overall_score", 96)

        c_id = item.get("id") or b.get("id")
        if not c_id:
            continue

        summaries.append({
            "id": c_id,
            "user_id": str(c_user) if c_user is not None else None,
            "product_name": bk.get("product_name", "Campaign"),
            "tagline": bk.get("tagline", ""),
            "brand_tone": bk.get("brand_tone", ""),
            "concept_title": concept.get("title", "Core Campaign"),
            "persona_name": persona.get("persona_name", "Primary Audience"),
            "score": score,
            "status": "Validated" if vr.get("passed", True) else "Review",
            "created_at": b.get("created_at") or item.get("created_at") or "2026-11-19T00:00:00Z",
            "bundle": b,
        })

    # If an authenticated user is requesting, strictly return ONLY their campaigns
    if user_id:
        user_campaigns = [c for c in summaries if c.get("user_id") == str(user_id)]
        seen = set()
        deduped = []
        for s in reversed(user_campaigns):
            if s["id"] not in seen:
                seen.add(s["id"])
                deduped.append(s)
        return jsonify({"status": "success", "campaigns": deduped}), 200

    # Otherwise return all recent campaigns (for unauthenticated / guest testing)
    seen = set()
    deduped = []
    for s in reversed(summaries):
        if s["id"] not in seen:
            seen.add(s["id"])
            deduped.append(s)

    return jsonify({"status": "success", "campaigns": deduped[:12]}), 200


@campaign_bp.get("/<campaign_id>")
def get_campaign_detail(campaign_id):
    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])
    record = next(
        (c for c in campaigns if c.get("id") == campaign_id or c.get("bundle", {}).get("id") == campaign_id),
        None
    )

    if not record:
        return jsonify({"error": "Campaign not found"}), 404

    bundle = record.get("bundle", record)
    return jsonify({"status": "success", "campaign": bundle}), 200


@campaign_bp.put("/<campaign_id>")
def update_campaign_detail(campaign_id):
    data = request.get_json(silent=True) or {}
    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])

    idx = next(
        (i for i, c in enumerate(campaigns) if c.get("id") == campaign_id or c.get("bundle", {}).get("id") == campaign_id),
        None
    )
    if idx is None:
        return jsonify({"error": "Campaign not found"}), 404

    existing = campaigns[idx]
    bundle = existing.get("bundle", existing)
    c_user = existing.get("user_id") or bundle.get("user_id")

    if "brand_kit" in data:
        bundle["brand_kit"] = data["brand_kit"]
    if "persona" in data:
        bundle["persona"] = data["persona"]
    if "all_personas" in data:
        bundle["all_personas"] = data["all_personas"]
    if "assets_by_persona" in data:
        bundle["assets_by_persona"] = data["assets_by_persona"]
    if "concept" in data:
        bundle["concept"] = data["concept"]
    if "social_post" in data:
        bundle["social_post"] = data["social_post"]
    if "email" in data:
        bundle["email"] = data["email"]
    if "assets" in data:
        bundle["assets"] = data["assets"]
    if "user_id" in data and not c_user:
        c_user = str(data["user_id"])
        bundle["user_id"] = c_user

    campaigns[idx] = {"id": campaign_id, "user_id": c_user, "bundle": bundle}
    storage_service.write_json(campaigns_path, campaigns)
    return jsonify({"status": "success", "campaign": bundle}), 200


@campaign_bp.delete("/<campaign_id>")
def delete_campaign_entry(campaign_id):
    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])

    updated = [c for c in campaigns if c.get("id") != campaign_id and c.get("bundle", {}).get("id") != campaign_id]
    storage_service.write_json(campaigns_path, updated)
    return jsonify({"status": "success", "message": "Campaign deleted"}), 200


@campaign_bp.get("/export/<campaign_id>")
def export_campaign(campaign_id):
    fmt = request.args.get("format", "json").lower()
    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])
    record = next((c for c in campaigns if c.get("id") == campaign_id), None)

    if not record:
        return jsonify({"error": "Campaign not found"}), 404

    bundle = record.get("bundle", record)

    if fmt == "markdown":
        content = generate_markdown_export(bundle)
        return current_app.response_class(
            content,
            mimetype="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=campaign_{campaign_id}.md"}
        ), 200
    else:
        content = generate_json_export(bundle)
        return current_app.response_class(
            content,
            mimetype="application/json",
            headers={"Content-Disposition": f"attachment; filename=campaign_{campaign_id}.json"}
        ), 200
