"""Campaign routes — persona DNA, concepts, asset generation, Brand Guardian, auto-fix, and export."""
import uuid
import json
import re
import random
from urllib.parse import quote
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


@campaign_bp.post("/draft")
def save_draft():
    """Save or update an in-progress campaign draft."""
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id") or request.headers.get("X-User-Id") or session.get("user_id")
    draft_id = data.get("draft_id") or data.get("id") or f"draft-{uuid.uuid4()}"
    current_step = int(data.get("current_step", 1))
    now_iso = datetime.now(timezone.utc).isoformat()

    brand_kit = data.get("brand_kit") or {}
    persona = data.get("persona") or {}
    all_personas = data.get("all_personas") or ([persona] if persona else [])
    persona_dna = data.get("persona_dna")
    concept = data.get("selected_concept") or data.get("concept")
    concepts = data.get("concepts") or []
    assets = data.get("assets") or {}

    campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
    campaigns = storage_service.read_json(campaigns_path, default=[])

    existing_idx = next(
        (i for i, c in enumerate(campaigns) if c.get("id") == draft_id or c.get("bundle", {}).get("id") == draft_id),
        None
    )

    created_at = now_iso
    if existing_idx is not None:
        created_at = (
            campaigns[existing_idx].get("created_at")
            or campaigns[existing_idx].get("bundle", {}).get("created_at")
            or now_iso
        )

    bundle_record = {
        "id": draft_id,
        "user_id": str(user_id) if user_id is not None else None,
        "status": "Draft",
        "current_step": current_step,
        "brand_kit": brand_kit,
        "persona": persona,
        "all_personas": all_personas,
        "persona_dna": persona_dna,
        "concept": concept,
        "concepts": concepts,
        "assets": assets,
        "created_at": created_at,
        "updated_at": now_iso,
    }

    record = {
        "id": draft_id,
        "user_id": str(user_id) if user_id is not None else None,
        "status": "Draft",
        "current_step": current_step,
        "created_at": created_at,
        "updated_at": now_iso,
        "bundle": bundle_record,
    }

    if existing_idx is not None:
        campaigns[existing_idx] = record
    else:
        campaigns.append(record)

    storage_service.write_json(campaigns_path, campaigns)
    return jsonify({"status": "success", "draft_id": draft_id, "campaign": bundle_record}), 200


@campaign_bp.post("/generate-ad-hooks")
def generate_ad_hooks():
    """Generate persona- and Brand Kit-tailored ad headline hooks (filtered against banned words)."""
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit") or {}
    persona = data.get("persona") or {}

    product_name = (brand_kit.get("product_name") or "TravelMate Smart Mug").strip()
    product_desc = (brand_kit.get("product_description") or "").strip()
    tagline = (brand_kit.get("tagline") or "").strip()
    banned_words = [str(w).strip().lower() for w in (brand_kit.get("banned_words") or []) if str(w).strip()]
    p_name = (persona.get("persona_name") or "Modern Audience").strip()
    p_low = p_name.lower()

    is_beverage = bool(re.search(r"mug|coffee|cup|thermos|bottle|drink|temperature|sip|travelmate|brew|matcha|tea", f"{product_name} {product_desc}", re.I))
    is_security = bool(re.search(r"cyber|shield|security|cloud|guardrail|threat|zero.?trust|compliance", f"{product_name} {product_desc}", re.I))

    if is_security:
        hooks = [
            f"Stop threats before they escalate with {product_name}.",
            f"Built for {p_name}: autonomous cloud defense at scale.",
            f"Zero drift, total visibility — experience {product_name}.",
            f"{tagline or f'Precision enterprise protection powered by {product_name}.'}",
        ]
    elif is_beverage:
        if "student" in p_low:
            hooks = [
                f"Fuel marathon study sessions with {product_name}.",
                f"From 8 AM lectures to late-night library blocks, stay energized.",
                f"Never settle for lukewarm coffee between classes again.",
                f"Smart precision warmth engineered for unstoppable students.",
            ]
        elif "professional" in p_low or "working" in p_low or "executive" in p_low:
            hooks = [
                f"Back-to-back meetings? {product_name} holds your ideal temperature.",
                f"Boardroom focus starts with coffee that stays hot all morning.",
                f"Precision temperature control built for high-output workdays.",
                f"Executive craft meets effortless all-day thermal balance.",
            ]
        elif "travel" in p_low or "commut" in p_low:
            hooks = [
                f"From takeoff to touchdown, {product_name} keeps every sip right.",
                f"Leakproof smart warmth engineered across every time zone.",
                f"Upgrade every commute and terminal wait with {product_name}.",
                f"{tagline or f'Your perfect sip, wherever your journey leads.'}",
            ]
        else:
            hooks = [
                f"{tagline or f'Your drink, your exact temperature with {product_name}.'}",
                f"Precision warmth crafted for {p_name} on the move.",
                f"Never settle for lukewarm drinks again with {product_name}.",
                f"Smart all-day thermal retention tailored for {p_name}.",
            ]
    else:
        hooks = [
            f"{tagline or f'Elevate your daily standard with {product_name}.'}",
            f"Engineered for {p_name} who expect precision and performance.",
            f"Smarter workflows, stronger results: discover {product_name}.",
            f"The modern advantage built specifically for {p_name}.",
        ]

    # Deterministically strip any hook accidentally containing a Brand Kit banned word
    safe_hooks = [
        h for h in hooks
        if not any(re.search(rf"\b{re.escape(bw)}\b", h, re.I) for bw in banned_words)
    ]
    if not safe_hooks:
        safe_hooks = [f"Discover {product_name} — tailored for {p_name}."]

    random.shuffle(safe_hooks)
    return jsonify({"status": "success", "hooks": safe_hooks}), 200


@campaign_bp.post("/generate-ad-image")
def generate_ad_image():
    """Synthesize a high-resolution commercial ad image prompt & URL aligned with Brand Kit & Persona."""
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit") or {}
    persona = data.get("persona") or {}
    concept = data.get("concept") or {}

    style = (data.get("style") or "Commercial Studio").strip()
    aspect_ratio = (data.get("aspect_ratio") or "1:1").strip()
    custom_prompt = (data.get("custom_prompt") or "").strip()
    headline = (data.get("headline") or "").strip()

    dimensions = {
        "1:1": (1080, 1080),
        "16:9": (1280, 720),
        "9:16": (720, 1280),
    }
    width, height = dimensions.get(aspect_ratio, (1080, 1080))

    p_name = (brand_kit.get("product_name") or "TravelMate Smart Mug").strip()
    p_desc = (brand_kit.get("product_description") or "Modern flagship product").strip()
    persona_name = (persona.get("persona_name") or "Target Audience").strip()

    style_descriptions = {
        "Commercial Studio": "sleek minimalist commercial product photography, dramatic soft studio key lights, high-end editorial product placement, hyper-detailed, clean elegant backdrop",
        "Lifestyle in Context": f"candid authentic lifestyle advertisement showing a {persona_name} naturally using {p_name}, golden hour natural ambient lighting, cinematic 35mm photography",
        "Vibrant Digital Banner": "bold modern tech marketing banner, dynamic neon and vibrant gradient accents, high energy, commercial hero shot, award-winning social media ad",
        "Cinematic 3D": "premium 3D product render, Octane Render style, subsurface scattering, elegant luxury finish, photorealistic reflections, 8k resolution",
    }
    style_desc = style_descriptions.get(style, style_descriptions["Commercial Studio"])

    n = persona_name.lower()
    if "student" in n:
        context_scene = "college study session, modern university library with natural window light"
    elif any(k in n for k in ("professional", "working", "ciso", "cto", "executive")):
        context_scene = "contemporary executive boardroom, clean glass desk, high-rise cityscape view"
    elif "travel" in n or "commut" in n:
        context_scene = "sleek airport terminal lounge with sunlit panoramic windows"
    else:
        context_scene = "modern refined lifestyle studio environment"

    is_mug = bool(re.search(r"mug|coffee|cup|thermos|bottle|drink|temperature|sip|travelmate", f"{p_name} {p_desc}", re.I))
    if is_mug:
        product_detail = (
            f"Commercial hero shot of '{p_name}', a sleek modern smart travel coffee mug with brushed stainless steel "
            f"and matte black finish, glowing digital LED temperature readout display showing 140F, insulated leakproof lid, sharply in focus"
        )
    else:
        product_detail = f"Commercial hero shot of '{p_name}': {p_desc}, prominently centered and in sharp focus"

    final_prompt = custom_prompt or (
        f"Award-winning commercial product advertisement photography of '{p_name}'. {product_detail}. "
        f"Environment: {context_scene}. {style_desc}. Professional studio advertising photography, "
        f"razor-sharp focus on {p_name}, 8k resolution, crisp commercial lighting, photorealistic, no blur."
    )

    seed = random.randint(100000, 999999)
    encoded_prompt = quote(final_prompt, safe="")
    image_url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}"
        f"?width={width}&height={height}&model=turbo&nologo=true&seed={seed}"
    )

    resolved_headline = (
        headline
        or (concept.get("hook") or "").strip('"')
        or (brand_kit.get("tagline") or "")
        or f"Experience {p_name}"
    )

    return jsonify({
        "status": "success",
        "image_url": image_url,
        "prompt": final_prompt,
        "aspect_ratio": aspect_ratio,
        "width": width,
        "height": height,
        "persona_name": persona_name,
        "product_name": p_name,
        "headline": resolved_headline,
        "style": style,
        "seed": seed,
    }), 200


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

        # Automatic 1-pass closed-loop Auto-Fix before showing failing assets
        if not social_report.get("passed", True):
            social_violations = [
                v
                for dim in social_report.get("dimensions", [])
                for v in dim.get("violations", [])
            ]
            if social_violations:
                try:
                    social_post = provider.auto_fix_content(
                        "social_post", social_post, social_violations, brand_kit, persona, concept
                    )
                    social_report = run_brand_guardian(
                        "social_post", social_post, brand_kit, persona, concept, provider
                    )
                    social_report["auto_fixed"] = True
                except Exception:
                    pass

        if not email_report.get("passed", True):
            email_violations = [
                v
                for dim in email_report.get("dimensions", [])
                for v in dim.get("violations", [])
            ]
            if email_violations:
                try:
                    email = provider.auto_fix_content(
                        "email", email, email_violations, brand_kit, persona, concept
                    )
                    email_report = run_brand_guardian(
                        "email", email, brand_kit, persona, concept, provider
                    )
                    email_report["auto_fixed"] = True
                except Exception:
                    pass

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
        draft_id = data.get("draft_id")
        campaigns_path = str(Path(current_app.config["DATA_DIR"]) / "campaigns.json")
        campaigns = storage_service.read_json(campaigns_path, default=[])
        if draft_id:
            campaigns = [c for c in campaigns if c.get("id") != draft_id and c.get("bundle", {}).get("id") != draft_id]
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

        raw_status = b.get("status") or item.get("status")
        current_step = b.get("current_step") or item.get("current_step") or 1

        if raw_status == "Draft":
            item_status = "Draft"
            score = 90
        else:
            item_status = "Validated" if vr.get("passed", True) else "Review"
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
            "status": item_status,
            "current_step": current_step,
            "created_at": b.get("created_at") or item.get("created_at") or "2026-11-19T00:00:00Z",
            "updated_at": b.get("updated_at") or item.get("updated_at"),
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
