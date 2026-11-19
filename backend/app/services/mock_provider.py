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

    def suggest_personas(self, product_name: str, product_description: str = "", brand_tone: str = "") -> List[dict]:
        combined = f"{product_name} {product_description}".lower()
        if any(w in combined for w in ["security", "cyber", "cloud", "saas", "guardrail", "compliance", "threat", "devops", "software", "api"]):
            return [
                {
                    "persona_name": "Enterprise CISO",
                    "summary": "Security executive managing multi-cloud compliance and threat defense.",
                    "primary_goals": "Zero data breaches, automated compliance audit readiness, board-level risk transparency.",
                    "pain_points": "Alert fatigue, shadow IT, fragmented security tooling, developer friction.",
                    "core_motivations": "Executive governance, systemic resilience, and proactive threat mitigation.",
                    "emotional_triggers": "Reputational risk, audit failure, disruption to business continuity.",
                    "preferred_message_style": "Empirical, authoritative, risk-quantified, high-level.",
                    "buying_triggers": "SOC2/ISO27001 compliance, verifiable audit logging, enterprise SSO.",
                },
                {
                    "persona_name": "Startup CTO",
                    "summary": "Technical leader balancing engineering velocity with code safety.",
                    "primary_goals": "Rapid product shipping with continuous automated guardrails.",
                    "pain_points": "Manual security reviews slowing sprint velocity, lack of dedicated SecOps.",
                    "core_motivations": "Developer velocity, modern cloud-native architecture, investor readiness.",
                    "emotional_triggers": "Engineering bottlenecks, slow deployment cycles, developer pushback.",
                    "preferred_message_style": "Developer-first, pragmatic, concise, transparent.",
                    "buying_triggers": "One-click CI/CD integration, developer CLI, instant self-serve onboarding.",
                },
                {
                    "persona_name": "SecOps Specialist",
                    "summary": "Practitioner responsible for daily policy enforcement and incident response.",
                    "primary_goals": "Streamlined incident triage and continuous policy automation.",
                    "pain_points": "False positive fatigue, slow remediation workflows, manual spreadsheet audits.",
                    "core_motivations": "Actionable alerts, automated remediation, clean compliance reports.",
                    "emotional_triggers": "Late night incident pages, audit panic, unmanageable ticket queues.",
                    "preferred_message_style": "Direct, workflow-focused, technical, solution-oriented.",
                    "buying_triggers": "Automated remediation scripts, real-time Slack/PagerDuty alerts.",
                },
            ]
        elif any(w in combined for w in ["fitness", "wellness", "health", "workout", "gym", "nutrition", "running", "wearable"]):
            return [
                {
                    "persona_name": "Mindful Wellness Enthusiast",
                    "summary": "Health-conscious individual prioritizing daily vitality and clean routines.",
                    "primary_goals": "Nourishing physical energy, balancing stress, sustaining natural focus.",
                    "pain_points": "Midday fatigue, synthetic ingredients, inconsistent daily habits.",
                    "core_motivations": "Holistic health, clean ingredients, mindful living.",
                    "emotional_triggers": "Burnout, guilt from unhealthy shortcuts, craving calm vitality.",
                    "preferred_message_style": "Warm, uplifting, sensorial, authentic.",
                    "buying_triggers": "Organic certification, clean label, proven natural ingredients.",
                },
                {
                    "persona_name": "High-Performance Athlete",
                    "summary": "Goal-driven performer tracking measurable gains and peak recovery.",
                    "primary_goals": "Maximizing workout performance, rapid muscle recovery, stamina.",
                    "pain_points": "Plateaus, delayed recovery, injury risks, inaccurate tracking.",
                    "core_motivations": "Measurable athletic progress, competitive edge, peak fitness.",
                    "emotional_triggers": "Frustration with lack of progress, passion for discipline.",
                    "preferred_message_style": "Data-driven, motivational, sharp, high-energy.",
                    "buying_triggers": "Clinical studies, performance metrics, durability.",
                },
                {
                    "persona_name": "Busy Working Professional",
                    "summary": "Corporate professional balancing long work hours with healthy living.",
                    "primary_goals": "Convenient healthy habits that fit tightly into packed schedules.",
                    "pain_points": "Lack of time for prep, sedentary desk hours, afternoon energy slumps.",
                    "core_motivations": "Efficiency, sustained workday stamina, stress relief.",
                    "emotional_triggers": "Guilt over neglected health, desire to feel vibrant.",
                    "preferred_message_style": "Practical, crisp, time-saving, encouraging.",
                    "buying_triggers": "Quick preparation, portable design, seamless daily integration.",
                },
            ]
        elif any(w in combined for w in ["mug", "coffee", "tea", "drink", "sip", "beverage", "temperature", "brew", "thermos", "flask"]):
            return [
                {
                    "persona_name": "Student",
                    "summary": "Long classes and study blocks, needs convenient and reliable drinks.",
                    "primary_goals": "Stay energized during long study hours and lectures.",
                    "pain_points": "Drinks get cold during classes and library sessions.",
                    "core_motivations": "Convenience, reliability, and academic productivity.",
                    "emotional_triggers": "Fun, relatable, energetic student life.",
                    "preferred_message_style": "Short, energetic, student-friendly, casual.",
                    "buying_triggers": "Keeps drink at right temperature, affordable, aesthetic.",
                },
                {
                    "persona_name": "Working Professional",
                    "summary": "Back-to-back executive meetings, values productivity and convenience.",
                    "primary_goals": "Sustained productivity through back-to-back executive meetings.",
                    "pain_points": "No time to reheat coffee between client presentations.",
                    "core_motivations": "Professional polish, daily efficiency, and sleek design.",
                    "emotional_triggers": "Frustration with lukewarm coffee, focus on high output.",
                    "preferred_message_style": "Crisp, benefit-driven, modern, executive.",
                    "buying_triggers": "All-day precision temperature battery, leakproof design.",
                },
                {
                    "persona_name": "Traveller",
                    "summary": "Frequent travel and commutes, needs a portable and rugged solution.",
                    "primary_goals": "Consistent hydration and hot drinks across time zones and commutes.",
                    "pain_points": "Airport spills, poor hotel coffee, unstable car cup holders.",
                    "core_motivations": "Portability, rugged durability, and peace of mind on the go.",
                    "emotional_triggers": "Wanderlust, comfort of familiar beverages anywhere.",
                    "preferred_message_style": "Adventurous, practical, uplifting, compact.",
                    "buying_triggers": "Compact fit for travel bags, long battery life.",
                },
            ]
        else:
            safe_prod = product_name or "Product"
            return [
                {
                    "persona_name": "Discerning Quality Seeker",
                    "summary": f"Values premium reliability and thoughtful design in everyday products like {safe_prod}.",
                    "primary_goals": f"Invest in dependable solutions that deliver consistent daily satisfaction.",
                    "pain_points": "Cheap alternatives that break easily, overcomplicated features, poor customer support.",
                    "core_motivations": "Long-term value, craftsmanship, elevated experience.",
                    "emotional_triggers": "Pride in smart purchases, peace of mind.",
                    "preferred_message_style": "Authentic, premium, clear, benefit-focused.",
                    "buying_triggers": "Verified reviews, quality guarantee, durable construction.",
                },
                {
                    "persona_name": "High-Pace Modern Professional",
                    "summary": f"Busy individual seeking efficiency, convenience, and modern aesthetics with {safe_prod}.",
                    "primary_goals": "Save time, streamline routines, and enjoy modern convenience.",
                    "pain_points": "Wasted time, clumsy user experiences, lack of portability.",
                    "core_motivations": "Efficiency, modern lifestyle, daily ease.",
                    "emotional_triggers": "Relief from friction, feeling capable and organized.",
                    "preferred_message_style": "Direct, crisp, modern, benefit-oriented.",
                    "buying_triggers": "Time-saving features, seamless setup, sleek design.",
                },
                {
                    "persona_name": "Value & Lifestyle Enthusiast",
                    "summary": "Community-focused customer inspired by innovative, well-designed brands.",
                    "primary_goals": f"Find smart, stylish products that fit their personal lifestyle and values.",
                    "pain_points": "Overpriced legacy options without substance, bland branding.",
                    "core_motivations": "Smart value, relatable branding, positive everyday lifestyle.",
                    "emotional_triggers": "Excitement of discovering a great product, sharing recommendations.",
                    "preferred_message_style": "Engaging, friendly, vibrant, inspirational.",
                    "buying_triggers": "Transparent pricing, relatable story, strong community feedback.",
                },
            ]

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
        persona_name = persona_dna.get("persona_name", "Decision Maker")

        return [
            {
                "id": str(uuid.uuid4()),
                "title": f"The Proactive Guardrail Initiative",
                "angle": f"Systematic Risk Elimination for {persona_name}",
                "hook": f"Stop reacting to threats. Build unshakeable confidence with {product}.",
                "tone": "Confident, authoritative, forward-thinking",
                "rationale": f"Appeals directly to {persona_name}'s desire for predictability and seamless governance.",
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"Unlocking Velocity Without Compromise",
                "angle": f"High-Output Agility and Performance",
                "hook": f"Scale faster without sacrificing quality or security.",
                "tone": "Dynamic, empowering, high-energy",
                "rationale": f"Speaks to the ambition of {persona_name} striving for rapid growth without overhead.",
            },
            {
                "id": str(uuid.uuid4()),
                "title": f"The Strategic Advantage Benchmark",
                "angle": f"Competitive Dominance through Smart Systems",
                "hook": f"How modern market leaders outpace legacy limitations with {product}.",
                "tone": "Visionary, evidence-backed, premium",
                "rationale": f"Reinforces executive credibility and market differentiation for {persona_name}.",
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
