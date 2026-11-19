"""Google Gemini API Provider implementation."""
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, List, Any
from .ai_service import BaseAIProvider

logger = logging.getLogger(__name__)

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
MODEL_CANDIDATES = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
]


class GeminiProvider(BaseAIProvider):
    """Integrates Google Gemini Flash via REST API with fallback and error handling."""

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GeminiProvider requires a non-empty API key.")
        self._api_key = api_key

    def _call_gemini(self, prompt: str) -> str:
        """Call Gemini REST endpoint, trying candidate model endpoints if 404 occurs."""
        last_error = None

        for model_name in MODEL_CANDIDATES:
            url = f"{GEMINI_BASE_URL}/{model_name}:generateContent?key={self._api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json"
                }
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            try:
                with urllib.request.urlopen(req, timeout=20) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    candidates = res_json.get("candidates", [])
                    if not candidates:
                        raise RuntimeError("No candidates returned from Gemini API.")
                    content_parts = candidates[0].get("content", {}).get("parts", [])
                    if not content_parts:
                        raise RuntimeError("Empty content returned from Gemini API.")
                    return content_parts[0].get("text", "{}")
            except urllib.error.HTTPError as e:
                error_msg = e.read().decode("utf-8", errors="ignore")
                logger.warning("Gemini model %s returned HTTP %s: %s", model_name, e.code, error_msg)
                last_error = RuntimeError(f"Gemini API returned HTTP {e.code} for {model_name}")
                if e.code in (404, 503, 429):
                    # Model not available in this tier, temporary spike, or rate limited; try next candidate
                    continue
                raise last_error from e
            except Exception as e:
                logger.error("Gemini connection error: %s", e)
                raise RuntimeError(f"Gemini API request failed: {e}") from e

        if last_error:
            raise last_error
        raise RuntimeError("No candidate Gemini models succeeded.")

    def generate_persona_dna(self, brand_kit: dict, persona: dict) -> dict:
        prompt = (
            f"You are an expert marketing strategist. Analyze the following Brand Kit and Customer Persona:\n"
            f"Brand Kit: {json.dumps(brand_kit)}\nPersona: {json.dumps(persona)}\n\n"
            f"Return a JSON object with EXACTLY these keys:\n"
            f"- persona_name (string)\n"
            f"- audience_summary (string)\n"
            f"- core_value_angle (string)\n"
            f"- tone_vector (string)\n"
            f"- primary_hook (string)\n"
            f"- psychological_drivers (array of strings)\n"
            f"- differentiation_strategy (string)\n"
            f"Respond with JSON only."
        )
        raw = self._call_gemini(prompt)
        return json.loads(raw)

    def generate_campaign_concepts(self, brand_kit: dict, persona_dna: dict) -> List[dict]:
        prompt = (
            f"Generate exactly 3 distinct marketing campaign concepts based on:\n"
            f"Brand Kit: {json.dumps(brand_kit)}\nPersona DNA: {json.dumps(persona_dna)}\n\n"
            f"Return a JSON array of 3 objects, each having:\n"
            f"- id (string uuid)\n"
            f"- title (string)\n"
            f"- angle (string)\n"
            f"- hook (string)\n"
            f"- tone (string)\n"
            f"- rationale (string)\n"
            f"Respond with JSON only."
        )
        raw = self._call_gemini(prompt)
        res = json.loads(raw)
        return res if isinstance(res, list) else res.get("concepts", [])

    def generate_social_post(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned = brand_kit.get("banned_words", [])
        prompt = (
            f"Generate a brand-compliant social media post.\n"
            f"Product: {brand_kit.get('product_name')}\n"
            f"Concept: {concept.get('title')} ({concept.get('hook')})\n"
            f"Persona: {persona.get('persona_name')}\n"
            f"STRICT RULES:\n"
            f"1. Total length MUST be <= 280 characters.\n"
            f"2. NEVER use any of these banned words: {json.dumps(banned)}\n"
            f"Return a JSON object with: 'text' (string <= 280 chars), 'character_count' (integer), 'hashtags' (array of strings)."
        )
        raw = self._call_gemini(prompt)
        data = json.loads(raw)
        text = data.get("text", "")
        if len(text) > 280:
            text = text[:275] + "..."
        data["text"] = text
        data["character_count"] = len(text)
        return data

    def generate_email(self, brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned = brand_kit.get("banned_words", [])
        prompt = (
            f"Generate a marketing email.\n"
            f"Brand Kit: {json.dumps(brand_kit)}\n"
            f"Persona: {json.dumps(persona)}\n"
            f"Concept: {json.dumps(concept)}\n"
            f"STRICT RULES:\n"
            f"1. Subject line MUST be <= 60 characters.\n"
            f"2. Email body MUST be between 75 and 250 words.\n"
            f"3. NEVER use any of these banned words: {json.dumps(banned)}\n"
            f"Return a JSON object with: 'subject' (string <= 60 chars), 'body' (string 75-250 words), 'word_count' (integer)."
        )
        raw = self._call_gemini(prompt)
        data = json.loads(raw)
        body = data.get("body", "")
        words = body.split()
        data["word_count"] = len(words)
        return data

    def evaluate_brand_fit(self, content: str, brand_kit: dict, persona: dict, channel: str) -> dict:
        prompt = (
            f"Evaluate marketing copy for Brand Fit, Persona Fit, and Channel Fit.\n"
            f"Content: {content}\n"
            f"Brand Kit: {json.dumps(brand_kit)}\n"
            f"Persona: {json.dumps(persona)}\n"
            f"Channel: {channel}\n"
            f"Return JSON: 'brand_fit_score' (0-100), 'persona_fit_score' (0-100), 'channel_fit_score' (0-100), 'explanation' (string), 'passed' (boolean)."
        )
        raw = self._call_gemini(prompt)
        return json.loads(raw)

    def generate_explanation(self, content: dict, brand_kit: dict, persona: dict, concept: dict, channel: str) -> dict:
        prompt = (
            f"Provide a 'Why This Content?' business rationale for marketing copy.\n"
            f"Content: {json.dumps(content)}\n"
            f"Brand: {json.dumps(brand_kit)}\n"
            f"Persona: {json.dumps(persona)}\n"
            f"Concept: {json.dumps(concept)}\n"
            f"Return JSON with: 'persona_rationale', 'brand_rationale', 'channel_rationale', 'angle_explanation', 'audience_impact'."
        )
        raw = self._call_gemini(prompt)
        return json.loads(raw)

    def auto_fix_content(self, channel_type: str, current_content: dict, violations: List[str], brand_kit: dict, persona: dict, concept: dict) -> dict:
        banned = brand_kit.get("banned_words", [])
        prompt = (
            f"Fix this marketing copy to resolve violations while preserving the core concept angle and persona appeal.\n"
            f"Channel: {channel_type}\n"
            f"Current Content: {json.dumps(current_content)}\n"
            f"Violations: {json.dumps(violations)}\n"
            f"NEGATIVE CONSTRAINTS:\n"
            f"- DO NOT use any of these banned words: {json.dumps(banned)}\n"
            f"- If social_post, length MUST be <= 280 characters.\n"
            f"- If email, subject MUST be <= 60 characters, body MUST be 75-250 words.\n"
            f"Return fixed content in the exact same JSON format as current_content."
        )
        raw = self._call_gemini(prompt)
        return json.loads(raw)
