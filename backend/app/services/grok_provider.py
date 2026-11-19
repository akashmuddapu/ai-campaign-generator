"""xAI Grok / Groq Provider implementation."""
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, List, Any
from .ai_service import BaseAIProvider

logger = logging.getLogger(__name__)


class GrokProvider(BaseAIProvider):
    """Integrates xAI Grok API (and Groq) with error handling and fallback capabilities."""

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GrokProvider requires a non-empty API key.")
        self._api_key = api_key

        # Automatically detect if this is a Groq key (gsk_...) or xAI key
        if self._api_key.startswith("gsk_"):
            self._api_url = "https://api.groq.com/openai/v1/chat/completions"
            self._model = "llama-3.3-70b-versatile"
        else:
            self._api_url = "https://api.x.ai/v1/chat/completions"
            self._model = "grok-beta"

    def _call_grok(self, prompt: str) -> str:
        """Call chat completion endpoint securely."""
        payload = {
            "model": self._model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert marketing strategist and brand safety copywriter. Always output valid JSON only, without markdown fences."
                },
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "response_format": {"type": "json_object"}
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            self._api_url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._api_key}"
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                choices = res_json.get("choices", [])
                if not choices:
                    raise RuntimeError("No choices returned from AI API.")
                content = choices[0].get("message", {}).get("content", "{}")
                if content.startswith("```"):
                    lines = content.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()
                return content
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode("utf-8", errors="ignore")
            logger.error("AI API HTTP Error %s: %s", e.code, error_msg)
            raise RuntimeError(f"AI API returned HTTP {e.code}") from e
        except Exception as e:
            logger.error("AI API connection error: %s", e)
            raise RuntimeError(f"AI API request failed: {e}") from e

    def generate_persona_dna(self, brand_kit: dict, persona: dict) -> dict:
        prompt = (
            f"Analyze the Brand Kit and Persona:\n"
            f"Brand: {json.dumps(brand_kit)}\nPersona: {json.dumps(persona)}\n\n"
            f"Return JSON object with keys: persona_name, audience_summary, core_value_angle, "
            f"tone_vector, primary_hook, psychological_drivers (array of strings), differentiation_strategy."
        )
        return json.loads(self._call_grok(prompt))

    def generate_campaign_concepts(self, brand_kit: dict, persona_dna: dict) -> List[dict]:
        prompt = (
            f"Generate 3 distinct marketing campaign concepts for:\n"
            f"Brand: {json.dumps(brand_kit)}\nPersona DNA: {json.dumps(persona_dna)}\n\n"
            f"Return JSON array of 3 objects or object with 'concepts': [{ 'id': '...', 'title': '...', 'angle': '...', 'hook': '...', 'tone': '...', 'rationale': '...' }]."
        )
        res = json.loads(self._call_grok(prompt))
        return res if isinstance(res, list) else res.get("concepts", [])

    def generate_social_post(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned = brand_kit.get("banned_words", [])
        prompt = (
            f"Generate a social post. Product: {brand_kit.get('product_name')}. "
            f"Concept: {concept.get('title')}. Persona: {persona.get('persona_name')}.\n"
            f"RULES: Max 280 chars total. Banned words: {json.dumps(banned)}.\n"
            f"Return JSON: 'text' (string <= 280), 'character_count' (int), 'hashtags' (array)."
        )
        data = json.loads(self._call_grok(prompt))
        text = data.get("text", "")
        if len(text) > 280:
            text = text[:275] + "..."
        data["text"] = text
        data["character_count"] = len(text)
        return data

    def generate_email(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned = brand_kit.get("banned_words", [])
        prompt = (
            f"Generate a marketing email. Brand: {json.dumps(brand_kit)}. "
            f"Persona: {json.dumps(persona)}. Concept: {json.dumps(concept)}.\n"
            f"RULES: Subject <= 60 chars. Body 75-250 words. Banned words: {json.dumps(banned)}.\n"
            f"Return JSON: 'subject' (string <= 60), 'body' (string 75-250 words), 'word_count' (int)."
        )
        data = json.loads(self._call_grok(prompt))
        words = data.get("body", "").split()
        data["word_count"] = len(words)
        return data

    def evaluate_brand_fit(self, content: str, brand_kit: dict, persona: dict, channel: str) -> dict:
        prompt = (
            f"Evaluate copy for Brand Fit, Persona Fit, and Channel Fit.\n"
            f"Content: {content}\nBrand: {json.dumps(brand_kit)}\nPersona: {json.dumps(persona)}\nChannel: {channel}\n"
            f"Return JSON: 'brand_fit_score' (0-100), 'persona_fit_score' (0-100), 'channel_fit_score' (0-100), 'explanation', 'passed' (bool)."
        )
        return json.loads(self._call_grok(prompt))

    def generate_explanation(self, content: dict, brand_kit: dict, persona: dict, concept: dict, channel: str) -> dict:
        prompt = (
            f"Provide 'Why This Content?' business rationale.\n"
            f"Content: {json.dumps(content)}\nBrand: {json.dumps(brand_kit)}\nPersona: {json.dumps(persona)}\n"
            f"Return JSON: 'persona_rationale', 'brand_rationale', 'channel_rationale', 'angle_explanation', 'audience_impact'."
        )
        return json.loads(self._call_grok(prompt))

    def auto_fix_content(self, channel_type: str, current_content: dict, violations: List[str], brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned = brand_kit.get("banned_words", [])
        prompt = (
            f"Fix marketing copy to resolve violations.\n"
            f"Channel: {channel_type}\nContent: {json.dumps(current_content)}\nViolations: {json.dumps(violations)}\n"
            f"CONSTRAINTS: No banned words ({json.dumps(banned)}). Social <= 280 chars. Email subject <= 60 chars, body 75-250 words.\n"
            f"Return fixed content in same JSON format."
        )
        return json.loads(self._call_grok(prompt))
