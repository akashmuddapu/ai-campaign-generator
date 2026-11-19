"""Report Card service — executive score synthesis, grade mapping, and insights."""
import re
from typing import Dict, List, Any, Optional

from ..models.report_card import (
    CampaignReportCard,
    ScoreBreakdown,
    PersonaImpact,
    PredictedPerformance,
    AIInsights,
    ImprovementOption,
)
from .performance_forecast_service import calculate_predicted_performance


def calculate_grade(overall_score: int) -> str:
    """Calculates standardized letter grade: A+, A, B, C, D."""
    if overall_score >= 95:
        return "A+"
    if overall_score >= 90:
        return "A"
    if overall_score >= 80:
        return "B"
    if overall_score >= 70:
        return "C"
    return "D"


def calculate_launch_readiness(overall_score: int, has_violations: bool = False) -> str:
    """Calculates Launch Readiness status."""
    if has_violations or overall_score < 70:
        return "Needs Revision"
    if overall_score >= 85:
        return "Ready to Launch"
    return "Launch with Improvements"


def synthesize_report_card(campaign: Dict[str, Any]) -> CampaignReportCard:
    """
    Synthesizes the executive Campaign Report Card from existing campaign assets
    and Brand Guardian evaluation data with zero duplicate evaluation calls.
    """
    bundle = campaign.get("bundle") or campaign
    campaign_id = campaign.get("id") or bundle.get("id", "camp-unknown")
    assets = bundle.get("assets", {})
    brand_kit = bundle.get("brand_kit", {})
    concept = bundle.get("concept") or bundle.get("selected_concept", {})

    # 1. Collect validation data across assets
    brand_fit_scores = []
    persona_fit_scores = []
    channel_fit_scores = []
    compliance_scores = []
    has_banned_violations = False
    flagged_issues_count = 0

    subject_len = 42

    for channel_key, asset_data in assets.items():
        val = asset_data.get("validation_report") or {}
        dims = {d.get("dimension"): d for d in val.get("dimensions", [])}

        if "Brand Fit" in dims:
            brand_fit_scores.append(dims["Brand Fit"].get("score", 90))
        if "Persona Fit" in dims:
            persona_fit_scores.append(dims["Persona Fit"].get("score", 90))
        if "Channel Fit" in dims:
            channel_fit_scores.append(dims["Channel Fit"].get("score", 90))

        # Check compliance
        rule_dim = dims.get("Rule Compliance") or dims.get("Banned Words Check") or {}
        if rule_dim:
            compliance_scores.append(rule_dim.get("score", 100))
            if not rule_dim.get("passed", True) or len(rule_dim.get("violations", [])) > 0:
                has_banned_violations = True
                flagged_issues_count += len(rule_dim.get("violations", []))

        content = asset_data.get("content", {})
        if channel_key == "email":
            subj = content.get("subject", "")
            if subj:
                subject_len = len(subj)

    # 2. Derive 5 category scores (0–100 scale)
    avg_brand = int(round(sum(brand_fit_scores) / len(brand_fit_scores))) if brand_fit_scores else 92
    avg_persona = int(round(sum(persona_fit_scores) / len(persona_fit_scores))) if persona_fit_scores else 94
    avg_channel = int(round(sum(channel_fit_scores) / len(channel_fit_scores))) if channel_fit_scores else 90

    # Compliance: docked if banned words or length violations exist
    avg_compliance = 100 if not has_banned_violations else max(40, 100 - (flagged_issues_count * 15))
    if compliance_scores:
        avg_compliance = min(avg_compliance, int(round(sum(compliance_scores) / len(compliance_scores))))

    # Marketing quality: channel fit + tone stability
    marketing_quality = int(round((avg_channel * 0.7) + (avg_brand * 0.3)))

    # Creativity: hook presence + novelty score
    creativity_base = 92 if concept.get("hook") else 88
    creativity = min(98, max(75, int(round((creativity_base * 0.6) + (avg_persona * 0.4)))))

    score_breakdown = ScoreBreakdown(
        brand_consistency=avg_brand,
        persona_relevance=avg_persona,
        marketing_quality=marketing_quality,
        creativity=creativity,
        compliance=avg_compliance,
    )

    # Overall weighted score
    overall_score = int(round(
        (score_breakdown.brand_consistency * 0.25)
        + (score_breakdown.persona_relevance * 0.25)
        + (score_breakdown.compliance * 0.20)
        + (score_breakdown.marketing_quality * 0.15)
        + (score_breakdown.creativity * 0.15)
    ))

    if has_banned_violations:
        overall_score = min(overall_score, 68)

    grade = calculate_grade(overall_score)
    readiness = calculate_launch_readiness(overall_score, has_violations=has_banned_violations)

    # 3. Persona Impact Analysis
    persona_impacts: List[PersonaImpact] = []
    primary_persona = bundle.get("persona", {})
    if primary_persona:
        p_name = primary_persona.get("persona_name", "Primary Audience")
        trigger = primary_persona.get("emotional_triggers") or primary_persona.get("core_motivations") or "Productivity & seamless daily workflow"
        persona_impacts.append(
            PersonaImpact(
                persona_id=primary_persona.get("id", "p-1"),
                persona_name=p_name,
                relevance_score=avg_persona,
                primary_trigger=trigger,
            )
        )

    # Multi-persona support if personas array is present
    for p in bundle.get("personas", []):
        if p.get("persona_name") != primary_persona.get("persona_name"):
            p_score = max(80, avg_persona - 2)
            p_trig = p.get("emotional_triggers") or p.get("core_motivations") or "Value efficiency and performance"
            persona_impacts.append(
                PersonaImpact(
                    persona_id=p.get("id", f"p-{len(persona_impacts)+1}"),
                    persona_name=p.get("persona_name", "Secondary Persona"),
                    relevance_score=p_score,
                    primary_trigger=p_trig,
                )
            )

    # 4. Predicted Performance Benchmarks
    perf_dict = calculate_predicted_performance(
        overall_score=overall_score,
        persona_relevance=score_breakdown.persona_relevance,
        creativity=score_breakdown.creativity,
        brand_consistency=score_breakdown.brand_consistency,
        subject_length=subject_len,
    )
    predicted_performance = PredictedPerformance(**perf_dict)

    # 5. AI Insights (Strengths, Opportunities, Recommendations)
    strengths = []
    opportunities = []
    recommendations = []

    if score_breakdown.brand_consistency >= 90:
        strengths.append(f"Exemplary brand voice alignment with {brand_kit.get('product_name', 'brand')} guidelines.")
    if score_breakdown.persona_relevance >= 90:
        strengths.append("High resonance with target audience triggers and distinct value propositions.")
    if score_breakdown.compliance >= 95:
        strengths.append("Zero prohibited terms and strict compliance with channel character bounds.")

    if has_banned_violations:
        opportunities.append("Remove flagged policy terms to prevent brand reputation risks.")
    elif score_breakdown.creativity < 90:
        opportunities.append("Incorporate stronger narrative tension or curiosity gap in social copy.")
    else:
        opportunities.append("Refine email subject lines with dynamic personalization tokens.")

    if readiness == "Ready to Launch":
        recommendations.append("Authorized for multi-channel export and scheduled marketing distribution.")
        recommendations.append("Deploy LinkedIn social post during peak morning audience engagement hours.")
    else:
        recommendations.append("Execute 'Improve Campaign' 1-click remediation before authorizing public release.")

    ai_insights = AIInsights(
        top_strengths=strengths or ["Balanced multi-channel copy structure."],
        improvement_opportunities=opportunities or ["Continue testing subject line variations."],
        recommendations=recommendations or ["Export campaign bundle."],
    )

    return CampaignReportCard(
        campaign_id=campaign_id,
        overall_score=overall_score,
        grade=grade,
        launch_readiness=readiness,
        score_breakdown=score_breakdown,
        persona_impacts=persona_impacts,
        predicted_performance=predicted_performance,
        ai_insights=ai_insights,
    )


def generate_improvement_suggestions(campaign: Dict[str, Any]) -> List[ImprovementOption]:
    """
    Inspects campaign assets and returns actionable improvement suggestions.
    """
    bundle = campaign.get("bundle") or campaign
    assets = bundle.get("assets", {})
    suggestions: List[ImprovementOption] = []

    for channel_key, asset_data in assets.items():
        val = asset_data.get("validation_report") or {}
        content = asset_data.get("content", {})
        score = val.get("overall_score", 100)
        dims = {d.get("dimension"): d for d in val.get("dimensions", [])}

        rule_dim = dims.get("Rule Compliance") or dims.get("Banned Words Check") or {}
        violations = rule_dim.get("violations", [])

        if violations or score < 85:
            issue = f"Flagged policy terms: {', '.join(violations)}" if violations else "Suboptimal channel engagement pacing."
            action = "Regenerate copy removing prohibited terms while preserving persona hook."
            
            p_name = bundle.get("persona", {}).get("persona_name", "Target Audience")
            
            suggestions.append(
                ImprovementOption(
                    asset_id=f"asset-{channel_key}",
                    persona_name=p_name,
                    channel=channel_key,
                    current_issue=issue,
                    suggested_action=action,
                    projected_score_boost="+4 pts",
                )
            )

    # If no severe issues, provide proactive optimization suggestion
    if not suggestions:
        p_name = bundle.get("persona", {}).get("persona_name", "Target Audience")
        suggestions.append(
            ImprovementOption(
                asset_id="asset-email",
                persona_name=p_name,
                channel="email",
                current_issue="Subject line length is standard but can be tightened for mobile preview screens.",
                suggested_action="Refine subject line under 40 characters for higher mobile open rates.",
                projected_score_boost="+2 pts",
            )
        )

    return suggestions
