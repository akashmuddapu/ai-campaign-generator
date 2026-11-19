"""Deterministic Mock AI Provider for testing, local development, and offline fallback."""
import re
import uuid
from typing import Dict, List
from .ai_service import BaseAIProvider


class MockProvider(BaseAIProvider):
    """
    Mock AI Provider returning realistic, brand-compliant marketing assets and analyses.
    Generates differentiated strategic angles based on persona attributes.
    """

    def generate_persona_dna(self, brand_kit: dict, persona: dict) -> dict:
        persona_name = persona.get("persona_name", "Target Persona")
        product_name = brand_kit.get("product_name", "Our Product")
        goals = persona.get("primary_goals", "achieve operational excellence")
        pain_points = persona.get("pain_points", "fragmented workflows")
        motivations = persona.get("core_motivations", "delivering measurable value")

        is_technical = any(term in persona_name.lower() for term in ["ciso", "cto", "tech", "engineer", "security"])
        is_consumer = any(term in persona_name.lower() for term in ["consumer", "wellness", "shopper", "enthusiast", "busy"])

        if is_technical:
            hook = f"Empowering {persona_name} with automated resilience for {product_name}."
            tone_vector = "Authoritative, analytical, compliance-focused"
            drivers = ["Risk minimization", "Audit readiness", "Engineering autonomy"]
            strategy = f"Position {product_name} as an enterprise-grade standard directly eliminating {pain_points}."
        elif is_consumer:
            hook = f"Transform your daily routine with mindful vitality through {product_name}."
            tone_vector = "Vibrant, uplifting, authentically wellness-driven"
            drivers = ["Holistic balance", "Natural energy", "Sustained daily focus"]
            strategy = f"Highlight clean, invigorating ritual benefits overcoming {pain_points}."
        else:
            hook = f"Elevate your team's success with {product_name} engineered for {goals}."
            tone_vector = "Inspiring, pragmatic, outcome-oriented"
            drivers = ["Measurable impact", "Time optimization", "Strategic clarity"]
            strategy = f"Focus on how {product_name} systematically solves {pain_points}."

        return {
            "persona_name": persona_name,
            "audience_summary": f"Strategic profile for {persona_name} focused on {goals} while overcoming {pain_points}.",
            "core_value_angle": f"Targeted value alignment centered on {motivations}.",
            "tone_vector": tone_vector,
            "primary_hook": hook,
            "psychological_drivers": drivers,
            "differentiation_strategy": strategy,
        }

    def generate_campaign_concepts(self, brand_kit: dict, persona_dna: dict) -> List[dict]:
        product = brand_kit.get("product_name", "CampaignGuard")
        desc = brand_kit.get("product_description", "")
        persona_name = persona_dna.get("persona_name", "Decision Maker")

        is_beverage = any(w in (f"{product} {desc}").lower() for w in ["mug", "coffee", "drink", "tea", "beverage", "temperature", "sip", "brew", "travelmate"])
        is_security = any(w in (f"{product} {desc}").lower() for w in ["security", "cyber", "cloud", "saas", "software", "guardrail", "compliance"])

        if is_beverage:
            return [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Precision Temperature Initiative",
                    "angle": f"All-Day Beverage Heat Retention for {persona_name}",
                    "hook": f"Never settle for lukewarm coffee. Keep every sip at your exact temperature with {product}.",
                    "tone": "Vibrant, sophisticated, modern",
                    "rationale": f"Appeals directly to {persona_name}'s desire for sustained focus, premium taste, and reliable everyday warmth.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Unstoppable Momentum Anywhere",
                    "angle": "Peak Performance on the Move",
                    "hook": "Engineered for high achievers who refuse cold coffee.",
                    "tone": "Empowering, high-energy, ambitious",
                    "rationale": f"Speaks to {persona_name}'s busy lifestyle requiring dependable hydration without interruptions.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "The Everyday Luxury Benchmark",
                    "angle": "Smart Design Meets Premium Comfort",
                    "hook": f"Elevate your daily ritual with smart temperature control from {product}.",
                    "tone": "Warm, premium, lifestyle-focused",
                    "rationale": f"Reinforces everyday well-being and mindful refreshment for {persona_name}.",
                },
            ]
        elif is_security:
            return [
                {
                    "id": str(uuid.uuid4()),
                    "title": "The Proactive Guardrail Initiative",
                    "angle": f"Systematic Risk Elimination for {persona_name}",
                    "hook": f"Stop reacting to threats. Build unshakeable confidence with {product}.",
                    "tone": "Confident, authoritative, forward-thinking",
                    "rationale": f"Appeals directly to {persona_name}'s desire for predictability and seamless governance.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Unlocking Velocity Without Compromise",
                    "angle": "High-Output Agility and Performance",
                    "hook": "Scale faster without sacrificing quality or security.",
                    "tone": "Dynamic, empowering, high-energy",
                    "rationale": f"Speaks to the ambition of {persona_name} striving for rapid growth without overhead.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "The Strategic Advantage Benchmark",
                    "angle": "Competitive Dominance through Smart Systems",
                    "hook": f"How modern market leaders outpace legacy limitations with {product}.",
                    "tone": "Visionary, evidence-backed, premium",
                    "rationale": f"Reinforces executive credibility and market differentiation for {persona_name}.",
                },
            ]
        else:
            return [
                {
                    "id": str(uuid.uuid4()),
                    "title": f"The {product} Advantage",
                    "angle": f"Targeted Excellence for {persona_name}",
                    "hook": f"Elevate your daily experience and discover smarter results with {product}.",
                    "tone": "Confident, premium, results-oriented",
                    "rationale": f"Connects directly with {persona_name}'s primary motivations.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Uncompromising Quality & Innovation",
                    "angle": "Effortless Performance and Reliability",
                    "hook": f"Engineered for {persona_name} who refuse to settle for second best.",
                    "tone": "Empowering, inspiring, modern",
                    "rationale": f"Appeals to {persona_name}'s ambition for excellence.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "The Modern Standard",
                    "angle": "Seamless Integration into Everyday Routines",
                    "hook": f"Transform how you work and live with {product}.",
                    "tone": "Visionary, forward-thinking, clean",
                    "rationale": f"Positions {product} as an indispensable asset for {persona_name}.",
                },
            ]

    def generate_social_post(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        product = brand_kit.get("product_name", "CampaignGuard")
        desc = brand_kit.get("product_description", "")
        tagline = brand_kit.get("tagline", "")
        hook = concept.get("hook", f"Discover next-generation capabilities with {product}.").strip('"')
        persona_name = persona.get("persona_name", "Customer")

        is_beverage = any(w in (f"{product} {desc}").lower() for w in ["mug", "coffee", "drink", "tea", "beverage", "temperature", "sip", "brew"])
        is_security = any(w in (f"{product} {desc}").lower() for w in ["security", "cyber", "cloud", "saas", "software", "guardrail", "compliance"])

        if is_beverage:
            if "student" in persona_name.lower():
                text = f"Long lectures or study sessions? {hook} Keep your favorite drink at the perfect temperature anytime with {product}. Stay energized and focused. ☕"
            elif "professional" in persona_name.lower():
                text = f"Back-to-back meetings? {hook} {product} maintains your ideal temperature all day long with precision smart heating. 💼☕"
            else:
                text = f"On the move? {hook} {product} keeps your favorite brew hot across time zones with leakproof battery power. ✈️"
        elif is_security:
            text = f"{hook} Accelerate your workflow with precision, compliance, and verified safety with {product}. Discover how industry leaders scale with confidence."
        else:
            text = f"{hook} Experience {product} engineered for {persona_name}. {tagline or desc}"

        if len(text) > 270:
            text = text[:265] + "..."

        safe_tag = re.sub(r'[^a-zA-Z0-9]', '', product.split()[0] if product else 'Brand')
        hashtags = [f"#{safe_tag}", "#Innovation", "#Excellence"]

        return {
            "text": text,
            "character_count": len(text),
            "hashtags": hashtags,
        }

    def generate_email(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        product = brand_kit.get("product_name", "CampaignGuard")
        desc = brand_kit.get("product_description", "")
        tagline = brand_kit.get("tagline", "Quality and reliability in every moment.")
        persona_name = persona.get("persona_name", "Leader")
        concept_title = concept.get("title", "Strategic Growth")
        concept_hook = concept.get("hook", f"Experience the future with {product}.").strip('"')

        is_beverage = any(w in (f"{product} {desc}").lower() for w in ["mug", "coffee", "drink", "tea", "beverage", "temperature", "sip", "brew"])
        is_security = any(w in (f"{product} {desc}").lower() for w in ["security", "cyber", "cloud", "saas", "software", "guardrail", "compliance"])

        if is_beverage:
            subject = f"{product}: Perfect temperature for {persona_name}"
            body = (
                f"Dear {persona_name},\n\n"
                f"Whether you are heading into back-to-back commitments or embarking on a long journey, "
                f"settling for lukewarm drinks should never be on your agenda. With {product}, your favorite beverage "
                f"remains at the exact temperature you prefer from your very first sip to the last.\n\n"
                f"Engineered with intelligent temperature regulation and leakproof reliability, {product} combines "
                f"sleek design with dependable everyday performance. Experience seamless comfort and sustained energy "
                f"wherever your day takes you across any schedule.\n\n"
                f"Are you prepared to elevate your daily routine with {concept_title}? {concept_hook}\n\n"
                f"Discover why individuals like you trust {product} to stay refreshed and energized throughout the day.\n\n"
                f"Warm regards,\nThe {product} Team"
            )
        elif is_security:
            subject = f"{product}: Modernizing your strategy for 2026"
            body = (
                f"Dear {persona_name},\n\n"
                f"In an increasingly demanding business environment, maintaining brand consistency and operational excellence "
                f"is no longer optional—it is your primary competitive advantage. With {product}, your organization unlocks "
                f"a streamlined workflow designed specifically to address your critical priorities and eliminate recurring bottlenecks.\n\n"
                f"Our platform combines intelligent automation with rigorous guardrails, empowering your team to deploy impactful "
                f"initiatives faster while preserving complete brand integrity across every touchpoint. Experience seamless integration, "
                f"actionable diagnostics, and verifiable outcomes from day one.\n\n"
                f"Are you prepared to elevate your team's performance with {concept_title}?\n\n"
                f"Schedule a personalized consultation with our specialists to review tailored strategies for your unique needs.\n\n"
                f"Warm regards,\nThe {product} Strategic Team"
            )
        else:
            subject = f"{product}: Built specifically for {persona_name}"
            body = (
                f"Dear {persona_name},\n\n"
                f"Finding a solution that seamlessly balances uncompromising quality with everyday convenience "
                f"is essential. With {product}, you gain an exceptional product engineered directly around your primary needs.\n\n"
                f"{desc} Built with precision and care, our mission is to ensure you experience unmatched reliability "
                f"and peak satisfaction at every step. {concept_hook}\n\n"
                f"Discover how {product} elevates your experience and helps you achieve your goals with complete confidence. "
                f"{tagline}\n\n"
                f"Explore the new standard today and learn why {persona_name}s everywhere choose {product}.\n\n"
                f"Warm regards,\nThe {product} Customer Team"
            )

        if len(subject) > 60:
            subject = subject[:57] + "..."

        words = body.split()
        return {
            "subject": subject,
            "body": body,
            "word_count": len(words),
        }

    def evaluate_brand_fit(self, content: str, brand_kit: dict, persona: dict, channel: str) -> dict:
        return {
            "brand_fit_score": 92,
            "persona_fit_score": 90,
            "channel_fit_score": 94,
            "explanation": "Content aligns strongly with established brand tone and addresses persona-specific objectives effectively.",
            "passed": True,
        }

    def generate_explanation(self, content: dict, brand_kit: dict, persona: dict, concept: dict, channel: str) -> dict:
        persona_name = persona.get("persona_name", "Target Persona")
        product = brand_kit.get("product_name", "Our Solution")
        concept_title = concept.get("title", "Core Campaign")

        return {
            "persona_rationale": f"Directly speaks to {persona_name}'s core motivation of reducing friction and achieving verified outcomes.",
            "brand_rationale": f"Maintains {brand_kit.get('brand_tone', 'professional')} tonality, elevating {product} as an industry benchmark.",
            "channel_rationale": f"Optimized for {channel} with concise pacing, scannable structure, and a compelling call-to-action.",
            "angle_explanation": f"Leverages the '{concept_title}' strategic angle to establish trust before presenting the solution.",
            "audience_impact": "Drives engagement by demonstrating empathy for daily challenges coupled with immediate, credible utility.",
        }

    def auto_fix_content(self, channel_type: str, current_content: dict, violations: List[str], brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned_words = brand_kit.get("banned_words", [])

        if channel_type == "social_post":
            text = current_content.get("text", "")
            # Remove all banned words
            for bw in banned_words:
                text = re.sub(r'\b' + re.escape(bw) + r'\b', "advanced", text, flags=re.IGNORECASE)
            # Ensure length <= 280
            if len(text) > 280:
                text = text[:275] + "..."
            return {
                "text": text,
                "character_count": len(text),
                "hashtags": current_content.get("hashtags", ["#Growth", "#Security"]),
            }
        else:
            subject = current_content.get("subject", "")
            body = current_content.get("body", "")
            # Remove banned words
            for bw in banned_words:
                subject = re.sub(r'\b' + re.escape(bw) + r'\b', "premium", subject, flags=re.IGNORECASE)
                body = re.sub(r'\b' + re.escape(bw) + r'\b', "enterprise", body, flags=re.IGNORECASE)
            # Ensure subject <= 60
            if len(subject) > 60:
                subject = subject[:57] + "..."
            # Ensure body word count 75-250
            words = body.split()
            if len(words) < 75:
                padding = " We remain committed to delivering verified excellence, resilient compliance, and sustainable innovation across every stage of your growth journey."
                while len(body.split()) < 75:
                    body += padding
            elif len(words) > 250:
                body = " ".join(words[:240]) + "."

            return {
                "subject": subject,
                "body": body,
                "word_count": len(body.split()),
            }
