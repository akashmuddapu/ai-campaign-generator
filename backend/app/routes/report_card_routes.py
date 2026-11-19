"""Report Card routes — dynamic executive summary retrieval, live evaluation, improvement recommendations, and auto-regeneration."""
from pathlib import Path
from flask import Blueprint, jsonify, request, current_app

from ..services import storage_service
from ..services.report_card_service import (
    synthesize_report_card,
    generate_improvement_suggestions,
)
from ..services.brand_guardian import run_brand_guardian
from ..services.ai_service import get_ai_provider

report_card_bp = Blueprint("report_card", __name__)


def _find_campaign(campaign_id: str):
    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])
    for c in campaigns:
        if c.get("id") == campaign_id or (c.get("bundle") and c["bundle"].get("id") == campaign_id):
            return c, campaigns, campaigns_path
    return None, campaigns, campaigns_path


@report_card_bp.post("/report-card/evaluate")
def evaluate_live_report_card():
    """Dynamically evaluate a live campaign payload (Brand Kit + Personas + Assets) without requiring persistence."""
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit") or {}
    if not brand_kit and not data.get("assets"):
        return jsonify({"error": "brand_kit or assets payload is required"}), 400

    # If assets exist without validation_report, run deterministic Brand Guardian on them so scores are real
    assets = data.get("assets") or {}
    persona = data.get("persona") or ((data.get("all_personas") or [{}])[0] if data.get("all_personas") else {})
    concept = data.get("concept") or data.get("selected_concept") or {}
    provider = get_ai_provider()

    enriched_assets = {}
    for ch_key, asset_obj in assets.items():
        if not isinstance(asset_obj, dict):
            continue
        asset_copy = dict(asset_obj)
        if not asset_copy.get("validation_report") and asset_copy.get("content"):
            try:
                asset_copy["validation_report"] = run_brand_guardian(
                    ch_key, asset_copy["content"], brand_kit, persona, concept, provider
                )
            except Exception:
                pass
        enriched_assets[ch_key] = asset_copy

    live_campaign = {
        "id": data.get("id") or data.get("campaign_id") or "live-session",
        "brand_kit": brand_kit,
        "persona": persona,
        "all_personas": data.get("all_personas") or ([persona] if persona else []),
        "concept": concept,
        "assets": enriched_assets,
        "assets_by_persona": data.get("assets_by_persona") or {},
    }

    report_card = synthesize_report_card(live_campaign)
    return jsonify({"success": True, "data": report_card.to_dict()}), 200


@report_card_bp.get("/<campaign_id>/report-card")
def get_report_card(campaign_id: str):
    """Retrieve or dynamically synthesize the Campaign Report Card for a saved campaign."""
    campaign, _, _ = _find_campaign(campaign_id)
    if not campaign:
        return jsonify({"error": f"Campaign '{campaign_id}' not found"}), 404

    bundle = campaign.get("bundle") or campaign
    if not bundle.get("assets") and not (bundle.get("social_post") or bundle.get("email")):
        return jsonify({"error": "Campaign has no generated assets or validation data"}), 400

    report_card = synthesize_report_card(campaign)
    return jsonify({"success": True, "data": report_card.to_dict()}), 200


@report_card_bp.post("/<campaign_id>/report-card/improve")
def get_improvements(campaign_id: str):
    """Generate prioritized copy improvement recommendations based on Brand Kit & Brand Guardian evaluations."""
    campaign, _, _ = _find_campaign(campaign_id)
    if not campaign:
        # Allow live payload fallback if campaign wasn't persisted under this ID
        body = request.get_json(silent=True) or {}
        if body.get("brand_kit") or body.get("assets"):
            campaign = body
        else:
            return jsonify({"error": f"Campaign '{campaign_id}' not found"}), 404

    suggestions = generate_improvement_suggestions(campaign)
    return jsonify({"success": True, "data": {"suggestions": [s.to_dict() for s in suggestions]}}), 200


@report_card_bp.post("/<campaign_id>/report-card/apply-improvements")
def apply_improvements(campaign_id: str):
    """Applies Brand Kit-aligned improvements to weaker assets and re-calculates report card metrics."""
    campaign, campaigns, campaigns_path = _find_campaign(campaign_id)
    if not campaign:
        return jsonify({"error": f"Campaign '{campaign_id}' not found"}), 404

    bundle = campaign.get("bundle") or campaign
    brand_kit = bundle.get("brand_kit") or {}
    persona = bundle.get("persona") or {}
    concept = bundle.get("concept") or bundle.get("selected_concept") or {}
    provider = get_ai_provider()

    updated_count = 0
    for ch_type in ["social_post", "email"]:
        if ch_type in bundle.get("assets", {}):
            asset_entry = bundle["assets"][ch_type]
            curr_content = asset_entry.get("content", {})
            val_report = asset_entry.get("validation_report") or {}
            violations = []
            for dim in val_report.get("dimensions", []):
                violations.extend(dim.get("violations", []))
            if not violations:
                violations = ["Tighten copy for sharper brand voice and stronger persona hook"]
            try:
                fixed_content = provider.auto_fix_content(
                    ch_type, curr_content, violations, brand_kit, persona, concept
                )
                new_report = run_brand_guardian(ch_type, fixed_content, brand_kit, persona, concept, provider)
                asset_entry["content"] = fixed_content
                asset_entry["validation_report"] = new_report
                if ch_type in bundle and isinstance(bundle[ch_type], dict):
                    bundle[ch_type]["content"] = fixed_content
                    bundle[ch_type]["validation_report"] = new_report
                updated_count += 1
            except Exception:
                pass

    storage_service.write_json(campaigns_path, campaigns)
    new_report_card = synthesize_report_card(campaign)

    return jsonify({
        "success": True,
        "data": {
            "updated_assets_count": updated_count,
            "report_card": new_report_card.to_dict(),
            "message": "Assets improved against Brand Kit rules and report card re-scored successfully.",
        },
    }), 200
