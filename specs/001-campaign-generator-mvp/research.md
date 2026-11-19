# Research & Technical Decisions: CampaignGuard AI MVP

**Feature**: `001-campaign-generator-mvp`  
**Date**: 2026-11-18  
**Status**: Completed  

This document records the architectural and technology research decisions for CampaignGuard AI, resolving technical unknowns and establishing implementation standards across frontend, backend, AI integration, validation, and storage.

---

## Decision 1: AI Provider Abstraction & Multi-Model Integration

### Context
Constitutional Principle IV mandates support for both Google Gemini API and xAI Grok API without vendor lock-in. Furthermore, the clarification session ratified an automated demo fallback/mock mode to guarantee 100% hackathon demo continuity during network or quota disruptions.

### Decision
Implement an abstract base class `BaseAIProvider` exposing standard asynchronous-capable methods:
1. `generate_persona_dna(persona: dict, brand: dict) -> dict`
2. `generate_campaign_concepts(brand: dict, persona_dna: dict) -> list[dict]`
3. `generate_assets(concept: dict, brand: dict, persona: dict) -> dict`
4. `evaluate_semantic_fit(asset: dict, brand: dict, persona: dict) -> dict`
5. `auto_fix_content(asset: dict, violations: list, rules: dict) -> dict`
6. `explain_content(asset: dict, brand: dict, persona: dict) -> dict`

A factory function `get_ai_provider()` selects the provider based on the `AI_PROVIDER` environment variable (`gemini`, `grok`, or `mock`). 

- **Google Gemini Provider**: Utilizes Google's official SDK (`google-genai` / `google-generativeai`) or Google's OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`) using `openai` client with `gemini-1.5-flash`.
- **xAI Grok Provider**: Utilizes the OpenAI-compatible REST interface (`https://api.x.ai/v1`) using `openai` client initialized with `api_key=GROK_API_KEY` and `base_url="https://api.x.ai/v1"`, targeting `grok-beta`.
- **Mock Provider**: Returns high-fidelity, pre-calculated, deterministic campaign assets, concepts, and Brand Guardian scores if API keys are absent or network requests time out.

### Rationale
- The `openai` Python SDK already present in `backend/requirements.txt` (`openai==3.55.1`) natively supports custom `base_url`, allowing a single lightweight HTTP client to drive both Grok and Gemini (via Google's OpenAI endpoint) without introducing conflicting transport dependencies.
- Zero code changes are required when switching providers; switching requires only setting `AI_PROVIDER=gemini` or `AI_PROVIDER=grok` in `.env`.
- Mock fallback guarantees zero demo crashes on stage.

### Alternatives Considered
- Direct raw `requests` calls: Functional, but lacks standard retry handling and streaming capabilities.
- Heavy orchestration frameworks (LangChain / LlamaIndex): Rejected to keep the codebase simple and understandable for fresher developers (Principle X).

---

## Decision 2: Deterministic vs. Semantic Brand Guardian Validation

### Context
Brand compliance requires both exact boundary enforcement (banned words, character limits) and subjective marketing evaluation (tone alignment, persona fit).

### Decision
Divide the Brand Guardian validation pipeline into two distinct sequential stages:
1. **Deterministic Stage (Python Backend Logic)**:
   - **Banned-Word Scanner**: Performs regex boundary-aware, case-insensitive keyword scanning (`re.search(r'\b' + re.escape(word) + r'\b', text, re.IGNORECASE)`). Pinpoints exact offending words and character positions.
   - **Length & Constraint Validator**:
     - Social Post: Maximum 280 characters (`len(text) <= 280`).
     - Email Subject Line: Maximum 60 characters (`len(subject) <= 60`).
     - Email Body: Word count between 75 and 250 words (`75 <= len(body.split()) <= 250`).
2. **Semantic Stage (AI Provider Evaluation)**:
   - Evaluates Brand Fit (0-100), Persona Fit (0-100), and Channel Fit (0-100).
   - Returns diagnostic reasoning and specific suggestions.

The aggregate score is calculated as a weighted composite:
$$\text{Score} = (\text{BannedWordsPassed} \times 25) + (\text{LengthPassed} \times 25) + (\text{BrandFit} \times 0.20) + (\text{PersonaFit} \times 0.20) + (\text{ChannelFit} \times 0.10)$$
If any hard deterministic rule fails, the score is capped at 69 (Fail state, red badge).

### Rationale
- Deterministic checks run in <1ms with 100% accuracy and zero token cost.
- Semantic checks provide qualitative depth and advice.
- Combining both guarantees that critical corporate safety violations are never hallucinated away.

---

## Decision 3: Auto-Fix Engine with Negative Constraints

### Context
When content fails brand rules, marketers need a 1-click remediation action that fixes the problem without erasing the creative hook or audience angle.

### Decision
The Auto-Fix engine triggers the AI provider's `auto_fix_content` method with a specialized structured repair prompt:
- **Inputs**: Original Asset Copy, Persona Profile, Brand Tone, and Exact List of Detected Violations (e.g. `['banned_word: cheap', 'length_overrun: 312/280 chars']`).
- **Prompt Directive**: Explicit negative constraints:
  - "Rewrite the copy to strictly forbid using the words: ['cheap']."
  - "Ensure the total character count is strictly under 280 characters."
  - "Preserve the original core marketing hook, value proposition, and persona resonance."
- **Re-Validation**: The backend immediately routes the repaired copy back through the deterministic and semantic validators, updating the report before responding to the client.

### Rationale
- Prompting with negative constraints directly addresses LLM tendencies to reuse previous patterns while strictly penalizing the forbidden tokens.
- Immediate re-validation ensures the UI only displays verified results.

---

## Decision 4: Flask Server-Side Session & CORS Architecture

### Context
Constitutional Principle V requires secure server-side session management. The React frontend on Vite (port 5173) communicates with the Flask backend (port 5000) across origins.

### Decision
- **Session Storage**: Configure `Flask-Session` using filesystem-based session caching (`SESSION_TYPE = 'filesystem'`, `SESSION_FILE_DIR = 'backend/data/sessions'`).
- **Cookie Security**:
  - `SESSION_COOKIE_HTTPONLY = True` (prevents XSS cookie theft)
  - `SESSION_COOKIE_SAMESITE = 'Lax'`
  - `SESSION_COOKIE_SECURE = False` (in local development; True in production HTTPS)
- **CORS Setup**:
  - `flask_cors.CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])`
  - Frontend Axios configured with `axios.defaults.withCredentials = true`.
- **Password Security**: Passwords hashed using `werkzeug.security.generate_password_hash(method='scrypt')`.

### Rationale
- Native Flask server-side sessions prevent client-side JWT tampering and ensure immediate logout invalidation.
- `withCredentials = true` allows session cookies to pass cleanly between Vite and Flask during development and testing.

---

## Decision 5: Zero-Dependency Local JSON Storage Strategy

### Context
The hackathon MVP requires zero external database dependencies (PostgreSQL, Redis, MongoDB) for instant portability and setup, yet needs persistence across server restarts.

### Decision
Create a lightweight `StorageService` managing atomic JSON read/write operations:
- `backend/data/users.json`: User accounts, emails, password hashes, timestamps.
- `backend/data/brand_kits.json`: Saved brand kits (including sample presets).
- `backend/data/campaigns.json`: Saved campaigns, concepts, assets, and validation scores.

To prevent write collisions and file corruption:
- Use Python's standard `json` module with temporary file swapping (`tempfile.NamedTemporaryFile` + `os.replace`).
- Include in-memory file lock (`threading.Lock`) for concurrent requests.

### Rationale
- Works out-of-the-box on any machine running Python without installing or configuring database engines.
- Atomic file replacement prevents corrupted JSON if a write is interrupted.

---

## Decision 6: Campaign Export Generation

### Context
Marketers need standardized exports for distribution to CMS, scheduling tools, or team review.

### Decision
- **Markdown Exporter**: Generates a cleanly structured `.md` file formatted with GitHub Flavored Markdown, featuring tables for Brand Guardian scores, callout blocks for Persona DNA, and formatted code blocks for generated copy.
- **JSON Exporter**: Returns an indented, schema-validated JSON document (`json.dumps(indent=2)`) containing complete campaign data.
- **HTTP Delivery**: Endpoints return `Content-Disposition: attachment; filename="campaign-[id].[ext]"`.

### Rationale
- Markdown provides an immediate, human-readable dossier.
- JSON provides programmatic integration for downstream marketing stacks.
