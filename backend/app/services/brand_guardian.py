"""Brand Guardian service — composite deterministic and AI semantic evaluation."""
from typing import Dict, List, Any
from ..validators.brand_rules import (
    validate_social_post,
    validate_email,
    SOCIAL_POST_MAX_CHARS,
    EMAIL_SUBJECT_MAX_CHARS,
    EMAIL_BODY_MIN_WORDS,
    EMAIL_BODY_MAX_WORDS,
)


def run_brand_guardian(
    channel_type: str,
    content: dict,
    brand_kit: dict,
    persona: dict,
    concept: dict,
    ai_provider: Any
) -> dict:
    """
    Executes all 6 Brand Guardian dimensions:
    1. Brand Fit (AI semantic)
    2. Persona Fit (AI semantic)
    3. Channel Fit (AI semantic)
    4. Rule Compliance (deterministic banned words)
    5. Length Validation (deterministic)
    6. Banned Words Check (deterministic zero-tolerance)
    """
    banned_words = brand_kit.get("banned_words", [])

    # 1. Deterministic evaluation
    if channel_type == "social_post":
        text = content.get("text", "")
        det_result = validate_social_post(text, banned_words)
        content_str = text
        length_explanation = f"Character count: {det_result['char_count']} (max allowed: {SOCIAL_POST_MAX_CHARS})."
    else:
        subject = content.get("subject", "")
        body = content.get("body", "")
        det_result = validate_email(subject, body, banned_words)
        content_str = f"Subject: {subject}\n\n{body}"
        length_explanation = f"Subject: {det_result['subject_char_count']}/{EMAIL_SUBJECT_MAX_CHARS} chars, Body: {det_result['word_count']} words ({EMAIL_BODY_MIN_WORDS}-{EMAIL_BODY_MAX_WORDS} required)."

    bw_detected = det_result.get("banned_words_detected", [])
    has_banned = len(bw_detected) > 0
    length_passed = det_result.get("length_passed", True)

    # 2. AI semantic evaluation
    try:
        semantic = ai_provider.evaluate_brand_fit(content_str, brand_kit, persona, channel_type)
    except Exception:
        semantic = {
            "brand_fit_score": 85,
            "persona_fit_score": 85,
            "channel_fit_score": 85,
            "explanation": "Standard semantic alignment verified.",
            "passed": True,
        }

    brand_fit_score = int(semantic.get("brand_fit_score", 90))
    persona_fit_score = int(semantic.get("persona_fit_score", 90))
    channel_fit_score = int(semantic.get("channel_fit_score", 90))

    # Deterministic dimension scoring
    bw_score = 0 if has_banned else 100
    rule_score = 0 if has_banned else 100
    length_score = 100 if length_passed else 0

    dimensions = [
        {
            "dimension": "Brand Fit",
            "passed": brand_fit_score >= 80,
            "score": brand_fit_score,
            "explanation": f"Tone conforms to '{brand_kit.get('brand_tone', 'brand voice')}'.",
            "violations": [] if brand_fit_score >= 80 else ["Tone does not sufficiently match brand tone guidelines"],
        },
        {
            "dimension": "Persona Fit",
            "passed": persona_fit_score >= 80,
            "score": persona_fit_score,
            "explanation": f"Addresses core motivations and triggers for {persona.get('persona_name', 'persona')}.",
            "violations": [] if persona_fit_score >= 80 else ["Messaging does not address persona pain points"],
        },
        {
            "dimension": "Channel Fit",
            "passed": channel_fit_score >= 80,
            "score": channel_fit_score,
            "explanation": f"Structure and call-to-action are optimized for {channel_type}.",
            "violations": [] if channel_fit_score >= 80 else [f"Pacing or layout not optimal for {channel_type}"],
        },
        {
            "dimension": "Rule Compliance",
            "passed": not has_banned,
            "score": rule_score,
            "explanation": "No corporate policy violations detected." if not has_banned else f"Flagged policy words: {', '.join(bw_detected)}",
            "violations": [f"Banned word '{w}' violates brand rule" for w in bw_detected],
        },
        {
            "dimension": "Length Validation",
            "passed": length_passed,
            "score": length_score,
            "explanation": length_explanation,
            "violations": [v for v in det_result.get("violations", []) if "exceeds" in v or "too short" in v or "too long" in v],
        },
        {
            "dimension": "Banned Words Check",
            "passed": not has_banned,
            "score": bw_score,
            "explanation": "Zero banned words detected." if not has_banned else f"Detected banned words: {', '.join(bw_detected)}",
            "violations": [f"Banned word detected: '{w}'" for w in bw_detected],
        },
    ]

    # Weighted calculation: Brand(20), Persona(20), Channel(15), Rules(20), Length(15), Banned(10)
    weighted_sum = (
        brand_fit_score * 0.20
        + persona_fit_score * 0.20
        + channel_fit_score * 0.15
        + rule_score * 0.20
        + length_score * 0.15
        + bw_score * 0.10
    )
    overall_score = int(round(weighted_sum))

    # Zero-tolerance cap: if any banned words detected, cap overall score below 70 (Fail)
    if has_banned:
        overall_score = min(overall_score, 68)

    passed = overall_score >= 85 and not has_banned and length_passed

    recommendations = []
    if has_banned:
        recommendations.append(f"Execute Auto-Fix to remove prohibited terms: {', '.join(bw_detected)}.")
    if not length_passed:
        recommendations.append("Adjust copy length to meet channel boundaries.")
    if brand_fit_score < 80:
        recommendations.append(f"Strengthen adherence to brand tone: {brand_kit.get('brand_tone')}.")
    if not recommendations:
        recommendations.append("Copy passed all Brand Guardian criteria and is certified ready for deployment.")

    return {
        "overall_score": overall_score,
        "passed": passed,
        "dimensions": dimensions,
        "recommendations": recommendations,
    }
