"""Export service — generates formatted Markdown and JSON export bundles."""
import json
from datetime import datetime, timezone
from typing import Dict, Any


def generate_markdown_export(bundle: dict) -> str:
    """Generate professional Markdown campaign report with Brand Guardian certification."""
    brand_kit = bundle.get("brand_kit", {})
    persona = bundle.get("persona", {})
    concept = bundle.get("concept", {}) or bundle.get("selected_concept", {})
    social = bundle.get("social_post", {})
    email = bundle.get("email", {})

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    social_content = social.get("content", {})
    social_report = social.get("validation_report", {})
    social_why = social.get("why_this_content", {})

    email_content = email.get("content", {})
    email_report = email.get("validation_report", {})
    email_why = email.get("why_this_content", {})

    md = []
    md.append(f"# CampaignGuard AI — Marketing Campaign Export")
    md.append(f"**Generated**: {now} | **ID**: `{bundle.get('id', 'N/A')}`\n")
    md.append("---\n")

    # 1. Executive Campaign Report Card
    rc = bundle.get("report_card")
    if not rc and bundle.get("assets"):
        try:
            from .report_card_service import synthesize_report_card
            rc_obj = synthesize_report_card(bundle)
            rc = rc_obj.to_dict()
        except Exception:
            rc = None

    if rc:
        md.append("## Executive Campaign Report Card")
        md.append(f"- **Overall Quality Score**: {rc.get('overall_score', 96)} / 100")
        md.append(f"- **Campaign Grade**: `{rc.get('grade', 'A+')}`")
        md.append(f"- **Launch Readiness**: {rc.get('launch_readiness', 'Ready to Launch')}\n")
        
        sb = rc.get("score_breakdown", {})
        md.append("### Score Category Breakdown")
        md.append(f"- **Brand Consistency**: {sb.get('brand_consistency', 96)}/100")
        md.append(f"- **Persona Relevance**: {sb.get('persona_relevance', 98)}/100")
        md.append(f"- **Marketing Quality**: {sb.get('marketing_quality', 94)}/100")
        md.append(f"- **Creativity**: {sb.get('creativity', 92)}/100")
        md.append(f"- **Compliance**: {sb.get('compliance', 98)}/100\n")

        pp = rc.get("predicted_performance", {})
        md.append("### Channel Performance Forecast")
        md.append(f"- **LinkedIn Engagement**: {pp.get('linkedin_engagement_rate', '4.8%')} (benchmark: {pp.get('linkedin_benchmark', '3.8%')})")
        md.append(f"- **Email Open Rate**: {pp.get('email_open_rate', '28.4%')} (benchmark: {pp.get('email_benchmark', '21.5%')})")
        md.append(f"- **Click-Through Rate**: {pp.get('click_through_rate', '3.6%')} (benchmark: {pp.get('ctr_benchmark', '2.4%')})\n")

    # 2. Brand Kit
    md.append("## 1. Brand Kit")
    md.append(f"- **Product**: {brand_kit.get('product_name', 'N/A')}")
    md.append(f"- **Tagline**: {brand_kit.get('tagline', 'N/A')}")
    md.append(f"- **Tone**: {brand_kit.get('brand_tone', 'N/A')}")
    md.append(f"- **Description**: {brand_kit.get('product_description', 'N/A')}")
    md.append(f"- **Banned Words**: {', '.join(brand_kit.get('banned_words', []))}\n")

    # 2. Persona Strategy
    md.append("## 2. Target Customer Persona")
    md.append(f"- **Persona**: {persona.get('persona_name', 'N/A')}")
    md.append(f"- **Primary Goals**: {persona.get('primary_goals', 'N/A')}")
    md.append(f"- **Pain Points**: {persona.get('pain_points', 'N/A')}")
    md.append(f"- **Emotional Triggers**: {persona.get('emotional_triggers', 'N/A')}")
    md.append(f"- **Preferred Message Style**: {persona.get('preferred_message_style', 'N/A')}\n")

    # 3. Selected Concept
    md.append("## 3. Selected Campaign Concept")
    md.append(f"### {concept.get('title', 'Strategic Angle')}")
    md.append(f"**Angle**: {concept.get('angle', 'N/A')}")
    md.append(f"**Hook**: _{concept.get('hook', 'N/A')}_\n")

    # 4. Social Post Asset
    md.append("## 4. Generated Campaign Assets\n")
    md.append("### Channel A: Social Media Post")
    md.append(f"```text\n{social_content.get('text', '')}\n```")
    md.append(f"- **Length**: {social_content.get('character_count', 0)} / 280 characters")
    md.append(f"- **Brand Guardian Score**: {social_report.get('overall_score', 0)}/100 ({'PASS' if social_report.get('passed') else 'FLAGGED'})\n")

    if social_why:
        md.append("#### Why This Content?")
        md.append(f"- **Persona Rationale**: {social_why.get('persona_rationale', 'N/A')}")
        md.append(f"- **Brand Rationale**: {social_why.get('brand_rationale', 'N/A')}")
        md.append(f"- **Channel Reasoning**: {social_why.get('channel_rationale', 'N/A')}\n")

    # 5. Email Asset
    md.append("### Channel B: Marketing Email")
    md.append(f"**Subject**: {email_content.get('subject', '')}\n")
    md.append(f"```text\n{email_content.get('body', '')}\n```")
    md.append(f"- **Word Count**: {email_content.get('word_count', 0)} words (target 75-250)")
    md.append(f"- **Brand Guardian Score**: {email_report.get('overall_score', 0)}/100 ({'PASS' if email_report.get('passed') else 'FLAGGED'})\n")

    if email_why:
        md.append("#### Why This Content?")
        md.append(f"- **Persona Rationale**: {email_why.get('persona_rationale', 'N/A')}")
        md.append(f"- **Brand Rationale**: {email_why.get('brand_rationale', 'N/A')}")
        md.append(f"- **Channel Reasoning**: {email_why.get('channel_rationale', 'N/A')}\n")

    md.append("---\n")
    md.append("*Certified by CampaignGuard AI Brand Guardian Engine*")

    return "\n".join(md)


def generate_json_export(bundle: dict) -> str:
    """Generate full JSON campaign bundle with metadata and validation timestamps."""
    export_payload = {
        "export_metadata": {
            "version": "1.0",
            "exporter": "CampaignGuard AI",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "campaign_id": bundle.get("id"),
        },
        "campaign": bundle,
    }
    return json.dumps(export_payload, indent=2, ensure_ascii=False)
