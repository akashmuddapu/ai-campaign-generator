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


@campaign_bp.post("/generate-ad-hooks")
def generate_ad_hooks():
    """Generate high-converting, tailored marketing hook headlines for a given product and persona."""
    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit", {})
    persona = data.get("persona", {})
    product_name = brand_kit.get("product_name", "TravelMate Smart Mug")
    product_desc = brand_kit.get("product_description", "")
    persona_name = persona.get("persona_name", "Audience")

    n = persona_name.lower()
    is_beverage = any(w in (f"{product_name} {product_desc}").lower() for w in ["mug", "coffee", "cup", "drink", "temperature", "sip", "tea", "bottle", "travelmate"])

    if is_beverage:
        if "student" in n:
            hooks = [
                f"Fuel all-night study sessions with {product_name}.",
                f"From morning lectures to late exams, your brew stays 140°F.",
                f"Never drink cold coffee during study marathons again.",
                f"Smart heating designed for unstoppable students.",
            ]
        elif "professional" in n or "working" in n:
            hooks = [
                f"Back-to-back meetings? {product_name} keeps your coffee at 145°F.",
                f"Boardroom focus starts with coffee that never turns lukewarm.",
                f"Precision temperature control for high-output workdays.",
                f"Executive elegance meets all-day temperature perfection with {product_name}.",
            ]
        elif "travel" in n:
            hooks = [
                f"From takeoff to touchdown, {product_name} keeps your brew hot.",
                f"100% leakproof smart warmth across every time zone.",
                f"Never settle for cold travel coffee again.",
                f"Your perfect sip at 35,000 feet with {product_name}.",
            ]
        else:
            hooks = [
                f"Your drink. Your exact temperature with {product_name}.",
                f"Never settle for lukewarm coffee again.",
                f"Smart all-day heat retention engineered for {persona_name}.",
                f"Experience the perfect temperature from first sip to last.",
            ]
    else:
        hooks = [
            f"Elevate your daily standard with {product_name}.",
            f"Engineered for {persona_name} who refuse to compromise.",
            f"Smarter, faster, better: Experience {product_name}.",
            f"The modern solution for {persona_name}: {product_name}.",
        ]

    return jsonify({
        "status": "success",
        "persona_name": persona_name,
        "product_name": product_name,
        "hooks": hooks,
    }), 200


@campaign_bp.post("/generate-ad-image")
def generate_ad_image():
    """Generate a high-converting AI marketing image ad tailored to the brand, persona, and concept."""
    import urllib.parse
    import random

    data = request.get_json(silent=True) or {}
    brand_kit = data.get("brand_kit", {})
    persona = data.get("persona", {})
    concept = data.get("concept", {}) or data.get("selected_concept", {})
    style = data.get("style", "Commercial Studio")
    aspect_ratio = data.get("aspect_ratio", "1:1")
    custom_prompt = data.get("custom_prompt")
    headline = data.get("headline")

    product_name = brand_kit.get("product_name", "TravelMate Smart Mug")
    product_desc = brand_kit.get("product_description", "A smart travel mug that keeps drinks at your preferred temperature.")
    persona_name = persona.get("persona_name", "Target Audience")
    hook = (concept.get("hook") or concept.get("tagline") or brand_kit.get("tagline") or "Experience the difference.").replace('"', '')
    title = concept.get("title", "Elevate Your Day")

    # Dimensions based on standard marketing aspect ratios (divisible by 8/16 for neural rendering)
    dimensions = {
        "1:1": (1080, 1080),
        "16:9": (1280, 720),
        "9:16": (720, 1280),
    }
    width, height = dimensions.get(aspect_ratio, (1080, 1080))

    # Curate style prompt for ad creative
    style_prompts = {
        "Commercial Studio": "sleek minimalist commercial product photography, dramatic soft studio key lights, high-end editorial product placement, hyper-detailed, clean elegant backdrop",
        "Lifestyle in Context": f"candid authentic lifestyle advertisement, showing a {persona_name} naturally using {product_name}, golden hour natural ambient lighting, cinematic 35mm photography",
        "Vibrant Digital Banner": "bold modern tech marketing banner, dynamic neon and vibrant gradient accents, high energy, commercial hero shot, award-winning social media ad",
        "Cinematic 3D": "premium 3D product render, Octane Render style, subsurface scattering, elegant luxury finish, photorealistic reflections, 8k resolution",
    }
    style_desc = style_prompts.get(style, style_prompts["Commercial Studio"])

    # Determine scenario by persona
    n = persona_name.lower()
    if "student" in n:
        context_scene = "college study session, modern university library with natural window light"
    elif "professional" in n or "working" in n or "ciso" in n:
        context_scene = "contemporary executive boardroom, clean glass desk, high-rise cityscape view"
    elif "travel" in n:
        context_scene = "sleek airport terminal lounge with airplane wing visible through windows"
    else:
        context_scene = "modern aesthetic lifestyle environment"

    is_mug_or_beverage = any(w in (f"{product_name} {product_desc}").lower() for w in ["mug", "coffee", "cup", "thermos", "bottle", "drink", "temperature", "sip", "travelmate"])

    if is_mug_or_beverage:
        product_detail = (
            f"Commercial hero shot of the '{product_name}', a sleek modern smart travel coffee mug "
            f"with brushed stainless steel and matte black finish, digital LED temperature display glowing on the side reading 140°F, "
            f"insulated leakproof lid, prominently centered and in crisp sharp focus"
        )
    else:
        product_detail = f"Commercial hero shot of the '{product_name}': {product_desc}, prominently positioned and centered in sharp focus"

    if custom_prompt and custom_prompt.strip():
        final_prompt = custom_prompt.strip()
    else:
        final_prompt = (
            f"Award-winning commercial product advertisement photography of '{product_name}'. "
            f"{product_detail}. "
            f"Environment: {context_scene}. {style_desc}. "
            f"Professional studio advertising photography, razor-sharp focus on {product_name}, 8k resolution, crisp commercial lighting, photorealistic, no blur, no distortion."
        )

    seed = random.randint(1000, 999999)
    encoded = urllib.parse.quote(final_prompt)
    # Using model=turbo for instant, rate-limit-free image generation (avoids 'At its limit right now' queue error)
    image_url = f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&model=turbo&nologo=true&seed={seed}"

    return jsonify({
        "status": "success",
        "image_url": image_url,
        "prompt": final_prompt,
        "aspect_ratio": aspect_ratio,
        "width": width,
        "height": height,
        "persona_name": persona_name,
        "product_name": product_name,
        "headline": headline or hook or title,
        "style": style,
        "seed": seed,
    }), 200


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

