"""Report Card service — dynamic executive score synthesis aligned with the active Brand Kit."""
import re
from typing import Dict, List, Any

from ..models.report_card import (
    CampaignReportCard,
    ScoreBreakdown,
    PersonaImpact,
    PredictedPerformance,
    AIInsights,
    ImprovementOption,
    BrandKitAlignment,
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


def _parse_brand_tones(brand_tone_raw: Any) -> List[str]:
    if isinstance(brand_tone_raw, list):
        return [str(t).strip() for t in brand_tone_raw if str(t).strip()]
    if isinstance(brand_tone_raw, str):
        return [t.strip() for t in re.split(r"[,;/]+", brand_tone_raw) if t.strip()]
    return []


def _extract_keywords(text: str) -> List[str]:
    stop = {
        "with", "that", "this", "from", "your", "their", "have", "will", "into",
        "more", "than", "about", "every", "just", "make", "need", "needs", "keeps",
        "during", "between", "through", "without", "across", "using", "while",
    }
    words = re.findall(r"[a-zA-Z]{4,}", (text or "").lower())
    return [w for w in words if w not in stop]


def _collect_asset_texts(assets: Dict[str, Any], assets_by_persona: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts primary social/email text plus combined copy across all personas."""
    social_text = ""
    email_subject = ""
    email_body = ""
    all_texts: List[str] = []

    sp = assets.get("social_post", {})
    if isinstance(sp, dict):
        sp_c = sp.get("content", sp)
        social_text = (sp_c.get("text") or sp_c.get("body") or "").strip()
        if social_text:
            all_texts.append(social_text)

    em = assets.get("email", {})
    if isinstance(em, dict):
        em_c = em.get("content", em)
        email_subject = (em_c.get("subject") or "").strip()
        email_body = (em_c.get("body") or "").strip()
        if email_subject:
            all_texts.append(email_subject)
        if email_body:
            all_texts.append(email_body)

    if isinstance(assets_by_persona, dict):
        for p_assets in assets_by_persona.values():
            if not isinstance(p_assets, dict):
                continue
            p_sp = p_assets.get("social_post", {})
            if isinstance(p_sp, dict):
                t = (p_sp.get("content", p_sp).get("text") or "").strip()
                if t and t not in all_texts:
                    all_texts.append(t)
            p_em = p_assets.get("email", {})
            if isinstance(p_em, dict):
                c = p_em.get("content", p_em)
                for field_val in (c.get("subject", ""), c.get("body", "")):
                    fv = (field_val or "").strip()
                    if fv and fv not in all_texts:
                        all_texts.append(fv)

    return {
        "social_text": social_text,
        "email_subject": email_subject,
        "email_body": email_body,
        "combined": " ".join(all_texts),
    }


def synthesize_report_card(campaign: Dict[str, Any]) -> CampaignReportCard:
    """
    Dynamically synthesizes the executive Campaign Report Card aligned directly
    with the campaign's Brand Kit, personas, concept, and generated assets.
    """
    bundle = campaign.get("bundle") or campaign
    campaign_id = campaign.get("id") or bundle.get("id", "camp-unknown")
    assets = bundle.get("assets") or {}
    if not assets:
        # Support top-level social_post / email fallback
        if bundle.get("social_post") or bundle.get("email"):
            assets = {
                k: bundle[k]
                for k in ("social_post", "email")
                if isinstance(bundle.get(k), dict)
            }
    assets_by_persona = bundle.get("assets_by_persona") or {}
    brand_kit = bundle.get("brand_kit") or {}
    concept = bundle.get("concept") or bundle.get("selected_concept") or {}

    product_name = (brand_kit.get("product_name") or "Brand Campaign").strip()
    tagline = (brand_kit.get("tagline") or "").strip()
    product_description = (brand_kit.get("product_description") or "").strip()
    brand_tones = _parse_brand_tones(brand_kit.get("brand_tone", ""))
    banned_words = [
        str(w).strip()
        for w in (brand_kit.get("banned_words") or [])
        if str(w).strip()
    ]
    concept_title = (concept.get("title") or "").strip()
    concept_hook = (concept.get("hook") or "").strip()

    texts = _collect_asset_texts(assets, assets_by_persona)
    combined_copy = texts["combined"]
    combined_lower = combined_copy.lower()

    # 1. Collect Brand Guardian validation scores across assets
    brand_fit_scores: List[int] = []
    persona_fit_scores: List[int] = []
    channel_fit_scores: List[int] = []
    compliance_scores: List[int] = []
    has_banned_violations = False
    flagged_issues_count = 0

    for channel_key, asset_data in assets.items():
        if not isinstance(asset_data, dict):
            continue
        val = asset_data.get("validation_report") or {}
        dims = {d.get("dimension"): d for d in val.get("dimensions", []) if isinstance(d, dict)}

        if "Brand Fit" in dims:
            brand_fit_scores.append(int(dims["Brand Fit"].get("score", 90)))
        if "Persona Fit" in dims:
            persona_fit_scores.append(int(dims["Persona Fit"].get("score", 90)))
        if "Channel Fit" in dims:
            channel_fit_scores.append(int(dims["Channel Fit"].get("score", 90)))

        for rule_key in ("Rule Compliance", "Banned Words Check"):
            rule_dim = dims.get(rule_key)
            if rule_dim:
                compliance_scores.append(int(rule_dim.get("score", 100)))
                if not rule_dim.get("passed", True) or len(rule_dim.get("violations", [])) > 0:
                    has_banned_violations = True
                    flagged_issues_count += max(1, len(rule_dim.get("violations", [])))

    # 2. Deterministic Brand Kit alignment checks directly on generated copy
    flagged_banned_words: List[str] = []
    for bw in banned_words:
        if re.search(rf"\b{re.escape(bw)}\b", combined_copy, flags=re.IGNORECASE):
            flagged_banned_words.append(bw)

    if flagged_banned_words:
        has_banned_violations = True
        flagged_issues_count = max(flagged_issues_count, len(flagged_banned_words))

    # Product mention check
    product_tokens = [t for t in re.split(r"\s+", product_name.lower()) if len(t) >= 3]
    product_mentioned = (
        (product_name.lower() in combined_lower)
        or (len(product_tokens) > 0 and product_tokens[0] in combined_lower)
        or not combined_copy
    )

    # Tagline / Brand value prop alignment
    tagline_kw = _extract_keywords(f"{tagline} {product_description}")
    if tagline_kw and combined_copy:
        tagline_hits = sum(1 for kw in set(tagline_kw) if kw in combined_lower)
        tagline_aligned = tagline_hits >= 1 or (tagline.lower() in combined_lower)
    else:
        tagline_aligned = True

    # Brand tone alignment — determine which tones from the Brand Kit resonate
    matched_tones: List[str] = []
    for tone in brand_tones:
        t_low = tone.lower()
        # Direct match or high brand fit score confirms tone adherence
        if t_low in combined_lower or (brand_fit_scores and sum(brand_fit_scores) / len(brand_fit_scores) >= 85):
            matched_tones.append(tone)
    if not matched_tones and brand_tones and not has_banned_violations:
        matched_tones = brand_tones[: max(1, len(brand_tones) - 1)]

    # Channel spec checks
    channel_checks: List[Dict[str, Any]] = []
    length_penalty = 0

    social_text = texts["social_text"]
    email_subject = texts["email_subject"]
    email_body = texts["email_body"]
    subject_len = len(email_subject) if email_subject else 42

    if social_text:
        sp_len = len(social_text)
        sp_ok = sp_len <= 280
        if not sp_ok:
            length_penalty += 8
        channel_checks.append({
            "channel": "Social Post",
            "metric": f"{sp_len}/280 chars",
            "passed": sp_ok,
        })

    if email_subject:
        subj_ok = subject_len <= 60
        if not subj_ok:
            length_penalty += 6
        channel_checks.append({
            "channel": "Email Subject",
            "metric": f"{subject_len}/60 chars",
            "passed": subj_ok,
        })

    if email_body:
        body_words = len(email_body.split())
        body_ok = 50 <= body_words <= 260
        if not body_ok:
            length_penalty += 4
        channel_checks.append({
            "channel": "Email Body",
            "metric": f"{body_words} words",
            "passed": body_ok,
        })

    # 3. Derive dynamic 5-category scores (0–100 scale)
    base_brand = int(round(sum(brand_fit_scores) / len(brand_fit_scores))) if brand_fit_scores else 90
    if not product_mentioned and combined_copy:
        base_brand = max(70, base_brand - 4)
    elif product_mentioned and tagline_aligned and combined_copy:
        base_brand = min(99, base_brand + 2)
    avg_brand = max(60, min(99, base_brand))

    avg_persona = int(round(sum(persona_fit_scores) / len(persona_fit_scores))) if persona_fit_scores else 91
    avg_channel = int(round(sum(channel_fit_scores) / len(channel_fit_scores))) if channel_fit_scores else 90

    # Compliance: docked if banned words or channel length violations exist
    if has_banned_violations:
        avg_compliance = max(40, 100 - (flagged_issues_count * 18))
    else:
        avg_compliance = max(75, 100 - length_penalty)
    if compliance_scores:
        avg_compliance = min(avg_compliance, int(round(sum(compliance_scores) / len(compliance_scores))))

    # Marketing quality: channel fit + brand consistency - length penalty
    marketing_quality = max(65, min(99, int(round((avg_channel * 0.65) + (avg_brand * 0.35))) - (length_penalty // 2)))

    # Creativity: dynamically reflects concept hook, tagline presence, and copy richness
    creativity_base = 90
    if concept_hook:
        creativity_base += 4
    if tagline and tagline_aligned:
        creativity_base += 2
    if social_text and len(social_text) >= 90:
        creativity_base += 1
    creativity = min(98, max(72, int(round((creativity_base * 0.6) + (avg_persona * 0.4)))))

    score_breakdown = ScoreBreakdown(
        brand_consistency=avg_brand,
        persona_relevance=avg_persona,
        marketing_quality=marketing_quality,
        creativity=creativity,
        compliance=avg_compliance,
    )

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

    # 4. Dynamic Multi-Persona Impact Analysis (reads all_personas AND personas!)
    persona_impacts: List[PersonaImpact] = []
    seen_names = set()
    candidate_personas: List[Dict[str, Any]] = []

    primary_persona = bundle.get("persona") or {}
    if isinstance(primary_persona, dict) and primary_persona.get("persona_name"):
        candidate_personas.append(primary_persona)

    for key in ("all_personas", "personas"):
        p_list = bundle.get(key) or []
        if isinstance(p_list, list):
            for p in p_list:
                if isinstance(p, dict) and p.get("persona_name"):
                    candidate_personas.append(p)

    for idx, p in enumerate(candidate_personas):
        p_name = p.get("persona_name", "").strip()
        if not p_name or p_name.lower() in seen_names:
            continue
        seen_names.add(p_name.lower())

        trigger = (
            p.get("emotional_triggers")
            or p.get("core_motivations")
            or p.get("primary_goals")
            or p.get("summary")
            or f"Targeted value proposition for {p_name}"
        )

        # Compute per-persona relevance score dynamically from keyword overlap + asset coverage
        p_keywords = _extract_keywords(
            f"{p_name} {p.get('primary_goals', '')} {p.get('pain_points', '')} {p.get('core_motivations', '')} {p.get('emotional_triggers', '')}"
        )
        p_copy = combined_lower
        if isinstance(assets_by_persona, dict) and p_name in assets_by_persona:
            pa = assets_by_persona[p_name]
            p_copy = (
                f"{pa.get('social_post', {}).get('content', {}).get('text', '')} "
                f"{pa.get('email', {}).get('content', {}).get('subject', '')} "
                f"{pa.get('email', {}).get('content', {}).get('body', '')}"
            ).lower()

        overlap_hits = sum(1 for kw in set(p_keywords) if kw in p_copy) if p_keywords and p_copy else 0
        if idx == 0:
            p_score = avg_persona
        else:
            # Distinct realistic per-segment score grounded in overlap with Brand Kit copy
            delta = min(3, overlap_hits) - idx
            p_score = max(78, min(99, avg_persona + delta))

        persona_impacts.append(
            PersonaImpact(
                persona_id=p.get("id", f"p-{len(persona_impacts) + 1}"),
                persona_name=p_name,
                relevance_score=p_score,
                primary_trigger=trigger,
            )
        )

    # 5. Predicted Performance Benchmarks
    perf_dict = calculate_predicted_performance(
        overall_score=overall_score,
        persona_relevance=score_breakdown.persona_relevance,
        creativity=score_breakdown.creativity,
        brand_consistency=score_breakdown.brand_consistency,
        subject_length=subject_len,
    )
    predicted_performance = PredictedPerformance(**perf_dict)

    # 6. Brand-Kit-Aligned AI Insights
    strengths: List[str] = []
    opportunities: List[str] = []
    recommendations: List[str] = []

    tones_display = ", ".join(brand_tones) if brand_tones else "configured brand voice"
    persona_names = [pi.persona_name for pi in persona_impacts]
    personas_display = ", ".join(persona_names[:3]) if persona_names else "target audiences"

    if score_breakdown.brand_consistency >= 88 and product_mentioned:
        strengths.append(
            f"Strong brand alignment for {product_name} reflecting the {tones_display} tone guidelines."
        )
    if len(persona_impacts) > 1:
        strengths.append(
            f"Tailored messaging strategy across {len(persona_impacts)} audience segments ({personas_display})."
        )
    elif persona_impacts:
        strengths.append(
            f"Focused persona alignment targeting {persona_impacts[0].persona_name} goals and emotional triggers."
        )

    if not has_banned_violations:
        if banned_words:
            strengths.append(
                f"Zero banned words detected across all {len(banned_words)} Brand Kit guardrails ({', '.join(banned_words[:4])})."
            )
        else:
            strengths.append("Strict adherence to channel character bounds and brand compliance rules.")

    if email_subject and subject_len <= 60:
        strengths.append(
            f"Email subject line ({subject_len} chars) is optimized for mobile inbox preview visibility."
        )

    # Opportunities
    if flagged_banned_words:
        opportunities.append(
            f"Remove prohibited Brand Kit terms found in copy: {', '.join(flagged_banned_words)}."
        )
    elif has_banned_violations:
        opportunities.append(
            f"Resolve flagged Brand Guardian compliance rules for {product_name} before launch."
        )

    if not product_mentioned and combined_copy:
        opportunities.append(
            f"Explicitly weave '{product_name}' into primary copy to strengthen brand recall."
        )

    if tagline and not tagline_aligned and combined_copy:
        opportunities.append(
            f"Reinforce your Brand Kit tagline (\"{tagline}\") across social and email callouts."
        )

    if email_subject and subject_len > 50:
        opportunities.append(
            f"Tighten email subject line from {subject_len} to under 45 chars for sharper mobile impact."
        )

    if not opportunities:
        opportunities.append(
            f"A/B test an alternate hook for {product_name} targeting {persona_names[0] if persona_names else 'your core segment'} to lift click-through rates."
        )

    # Recommendations
    if readiness == "Ready to Launch":
        if concept_title:
            recommendations.append(
                f"\"{concept_title}\" for {product_name} is authorized for multi-channel export and launch."
            )
        else:
            recommendations.append(
                f"{product_name} campaign passes all Brand Kit checks and is ready for multi-channel export."
            )
        recommendations.append(
            f"Distribute tailored assets to {personas_display} and track engagement against the {predicted_performance.email_open_rate} projected open rate."
        )
    else:
        recommendations.append(
            f"Run 'Improve Campaign' to automatically remediate {product_name} compliance issues before publishing."
        )

    ai_insights = AIInsights(
        top_strengths=strengths[:4] or [f"Balanced multi-channel copy structure for {product_name}."],
        improvement_opportunities=opportunities[:3],
        recommendations=recommendations[:3],
    )

    alignment_summary = (
        f"Verified against {product_name}'s Brand Kit ({tones_display}) with "
        + (
            f"{len(flagged_banned_words)} banned-word violation(s)."
            if flagged_banned_words
            else f"0/{len(banned_words)} banned-word flags."
        )
    )

    brand_kit_alignment = BrandKitAlignment(
        product_name=product_name,
        tagline=tagline,
        product_description=product_description,
        brand_tones=brand_tones,
        matched_tones=matched_tones,
        banned_words=banned_words,
        flagged_banned_words=flagged_banned_words,
        product_mentioned=product_mentioned,
        tagline_aligned=tagline_aligned,
        concept_title=concept_title,
        concept_hook=concept_hook,
        alignment_summary=alignment_summary,
        channel_checks=channel_checks,
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
        brand_kit_alignment=brand_kit_alignment,
    )


def generate_improvement_suggestions(campaign: Dict[str, Any]) -> List[ImprovementOption]:
    """
    Inspects campaign assets against the active Brand Kit and returns actionable improvements.
    """
    bundle = campaign.get("bundle") or campaign
    assets = bundle.get("assets") or {}
    brand_kit = bundle.get("brand_kit") or {}
    product_name = (brand_kit.get("product_name") or "your product").strip()
    banned_words = [str(w).strip() for w in (brand_kit.get("banned_words") or []) if str(w).strip()]
    p_name = (bundle.get("persona") or {}).get("persona_name", "Target Audience")
    suggestions: List[ImprovementOption] = []

    for channel_key, asset_data in assets.items():
        if not isinstance(asset_data, dict):
            continue
        val = asset_data.get("validation_report") or {}
        content = asset_data.get("content") or {}
        score = val.get("overall_score", 100)
        dims = {d.get("dimension"): d for d in val.get("dimensions", []) if isinstance(d, dict)}

        violations = []
        for rule_key in ("Rule Compliance", "Banned Words Check"):
            violations.extend(dims.get(rule_key, {}).get("violations", []))

        # Also directly inspect against Brand Kit banned words
        raw_text = f"{content.get('text', '')} {content.get('subject', '')} {content.get('body', '')}"
        direct_banned = [
            bw for bw in banned_words if re.search(rf"\b{re.escape(bw)}\b", raw_text, flags=re.IGNORECASE)
        ]
        all_flags = list(dict.fromkeys(violations + direct_banned))

        if all_flags or score < 85:
            issue = (
                f"Flagged Brand Kit prohibited terms in {channel_key.replace('_', ' ')}: {', '.join(all_flags)}"
                if all_flags
                else f"Suboptimal channel alignment for {product_name} ({score}/100)."
            )
            action = f"Regenerate {product_name} copy removing prohibited terms while preserving the {p_name} hook."

            suggestions.append(
                ImprovementOption(
                    asset_id=f"asset-{channel_key}",
                    persona_name=p_name,
                    channel=channel_key,
                    current_issue=issue,
                    suggested_action=action,
                    projected_score_boost="+6 pts" if all_flags else "+4 pts",
                )
            )

    if not suggestions:
        em_subj = (assets.get("email", {}).get("content", {}) or {}).get("subject", "")
        subj_note = (
            f"Current subject line ({len(em_subj)} chars) for {product_name} can be tightened for mobile screens."
            if em_subj
            else f"Tighten {product_name} email opener for faster {p_name} engagement."
        )
        suggestions.append(
            ImprovementOption(
                asset_id="asset-email",
                persona_name=p_name,
                channel="email",
                current_issue=subj_note,
                suggested_action=f"Refine {product_name} subject line under 42 chars highlighting {p_name} value.",
                projected_score_boost="+2 pts",
            )
        )

    return suggestions
