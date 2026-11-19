"""Report Card routes — executive summary retrieval, improvement recommendations, and auto-regeneration."""
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


@report_card_bp.get("/<campaign_id>/report-card")
def get_report_card(campaign_id: str):
    """Retrieve or dynamically synthesize the Campaign Report Card."""
    campaign, _, _ = _find_campaign(campaign_id)
    if not campaign:
        return jsonify({"error": f"Campaign '{campaign_id}' not found"}), 404

    bundle = campaign.get("bundle") or campaign
    if not bundle.get("assets"):
        return jsonify({"error": "Campaign has no generated assets or validation data"}), 400

    report_card = synthesize_report_card(campaign)
    return jsonify({"success": True, "data": report_card.to_dict()}), 200


@report_card_bp.post("/<campaign_id>/report-card/improve")
def get_improvements(campaign_id: str):
    """Generate prioritized copy improvement recommendations based on Brand Guardian evaluations."""
    campaign, _, _ = _find_campaign(campaign_id)
    if not campaign:
        return jsonify({"error": f"Campaign '{campaign_id}' not found"}), 404

    suggestions = generate_improvement_suggestions(campaign)
    return jsonify({"success": True, "data": {"suggestions": [s.to_dict() for s in suggestions]}}), 200


@report_card_bp.post("/<campaign_id>/report-card/apply-improvements")
def apply_improvements(campaign_id: str):
    """Applies improvements to weaker assets and re-calculates report card metrics."""
    campaign, campaigns, campaigns_path = _find_campaign(campaign_id)
    if not campaign:
        return jsonify({"error": f"Campaign '{campaign_id}' not found"}), 404

    bundle = campaign.get("bundle") or campaign
    brand_kit = bundle.get("brand_kit", {})
    persona = bundle.get("persona", {})
    concept = bundle.get("concept") or bundle.get("selected_concept", {})
    provider = get_ai_provider()

    updated_count = 0
    # Auto-fix flagged assets
    for ch_type in ["social_post", "email"]:
        if ch_type in bundle.get("assets", {}):
            curr_content = bundle["assets"][ch_type].get("content", {})
            try:
                fixed_content = provider.auto_fix_content(ch_type, curr_content, brand_kit, persona, concept, ["cheap", "easy"])
                new_report = run_brand_guardian(ch_type, fixed_content, brand_kit, persona, concept, provider)
                bundle["assets"][ch_type]["content"] = fixed_content
                bundle["assets"][ch_type]["validation_report"] = new_report
                updated_count += 1
            except Exception:
                pass

    # Save updated campaign
    storage_service.write_json(campaigns_path, campaigns)

    # Re-synthesize report card
    new_report_card = synthesize_report_card(campaign)

    return jsonify({
        "success": True,
        "data": {
            "updated_assets_count": updated_count,
            "report_card": new_report_card.to_dict(),
            "message": "Weaker assets regenerated and report card re-scored successfully."
        }
    }), 200
