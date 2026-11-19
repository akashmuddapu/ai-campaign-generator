# Implementation Plan: CampaignGuard AI MVP

**Branch**: `001-campaign-generator-mvp` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [specs/001-campaign-generator-mvp/spec.md](spec.md) and ratified clarification decisions.

## Summary

CampaignGuard AI is an AI-powered marketing campaign generation and validation web application that helps marketers produce differentiated, brand-consistent marketing campaigns for diverse customer personas.

The technical architecture strictly implements the approved modular structure:
1. **Frontend**: React 19 + Vite 8 + Tailwind CSS 4 single-page application following the CampaignGuard AI visual direction (light lavender/white background `#FAF5FF` / `#F8F7FC`, deep brand purple `#6B21A8` / `#7C3AED`, dark navy typography `#0F172A`, rounded cards, shield branding, and visible status states).
2. **Backend**: Python 3.13 + Flask 3.1 REST API organized strictly into `routes → services → validators → models`.
3. **AI Provider Abstraction**: A decoupled `BaseAIProvider` interface supporting Google Gemini API (`gemini-1.5-flash`), xAI Grok API (`grok-beta`), and an automatic offline Mock Provider for resilient, zero-failure hackathon demonstrations. Active provider is configurable via `AI_PROVIDER`.
4. **Deterministic & Semantic Brand Guardian**:
   - **Deterministic Validation**: Python backend regex boundary word matching for Banned Words, and strict numerical bounds for length: Social Post (max 280 characters), Email Subject (max 60 characters), and Email Body (75–250 words).
   - **Semantic AI Evaluation**: Qualitative evaluation of Brand Fit, Persona Fit, and Channel Fit, producing an aggregate 0–100 score and itemized diagnostics.
5. **AI-Guided Auto-Fix Engine**: Uses structured negative-constraint repair prompts to remove banned words and enforce channel length bounds while strictly preserving the persona hook and concept angle, followed by immediate re-scoring.
6. **1-Click Demo Presets**: Pre-seeded B2B Tech ("CyberShield") and B2C Consumer ("ZenBrew") Brand Kits with contrasting personas to enable instant live hackathon evaluation.
7. **Security, Persistence & Export**: Server-side Flask session cookies, salted Scrypt password hashing, atomic local JSON storage (`backend/data/`), "Why This Content?" business explanations, and Markdown/JSON export generation.

---

## Technical Context

**Language/Version**: Python 3.13+ (Backend), JavaScript / Node.js 20+ (Frontend)

**Primary Dependencies**:
- **Backend**: Flask 3.1, Flask-CORS 6.0, Flask-Session 0.8, Werkzeug 3.1, Pydantic 2.14, python-dotenv 1.2, OpenAI SDK 3.55 (utilized as standard HTTP client for Grok API and Gemini's OpenAI-compatible endpoint)
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router DOM 7, Axios 1.21, Lucide React 1.75

**Storage**: Local JSON files in `backend/data/` (`users.json`, `brand_kits.json`, `campaigns.json`) utilizing atomic write swaps (`tempfile` + `os.replace`) and thread-safe locking.

**Testing Strategy**:
- **Backend**: Pytest 9.2 (unit tests for deterministic validators, contract tests for REST endpoints, service tests for AI provider switching, auto-fix, and export generation)
- **Frontend**: Vitest 5.1, React Testing Library 16.3, jsdom 31.0 (component rendering, preset loading, auth flow, and generation views)

**Target Platform**: Cross-platform Web application running locally on modern browsers (Vite port 5173, Flask port 5000).

**Project Type**: Full-stack Web Application (React frontend + Flask REST API).

**Performance Goals**:
- <300ms p95 latency for local REST API endpoints (auth, presets, validation).
- <3.5s response time for AI generation calls.
- <2.0s generation and download time for Markdown and JSON exports.

**Constraints**:
- Zero external database or cache infrastructure dependencies (PostgreSQL/Redis) required to run or demo.
- API keys must never be committed to Git or exposed in frontend client bundles.
- Automatic mock fallback must engage if API keys are unset or network requests fail.

**Scale/Scope**: Hackathon MVP demo-ready, supporting multiple personas, 3 campaign concepts per run, and 2 core channels (Social Media Post & Marketing Email).

---

## Clarification Decisions Reference

The following decisions were formally ratified in `spec.md` and are embedded directly into this plan:
1. **Onboarding Presets**: 1-click "Load Sample Campaign" presets for B2B Tech and B2C Consumer with contrasting personas alongside custom input.
2. **Deterministic Length Constraints**:
   - Social Post: Maximum 280 characters.
   - Email Subject Line: Maximum 60 characters.
   - Email Body: 75–250 words.
3. **Auto-Fix Remediation**: AI-guided repair with explicit negative constraints (strictly forbidding flagged banned words, enforcing length limits, keeping the persona angle) followed by immediate automated re-validation.
4. **Resilient AI Fallback**: Built-in mock provider mode in the AI service layer returning realistic pre-generated assets when API keys are unset or network requests fail, ensuring 100% demo continuity.
5. **Multi-Model Support**: Decoupled provider layer enabling runtime switching between Google Gemini API and xAI Grok API via `AI_PROVIDER` environment variable.

---

## Constitution Check

*GATE: All 13 constitutional principles verified and passing.*

- [x] **I. Specification-Driven**: Requirements are documented and scope is bounded in `spec.md`.
- [x] **II. Test-Driven Development**: Test strategy defined for all functional requirements (auth, gen, personas, brand validation, auto-fix, export).
- [x] **III. Modular Architecture**: Separation preserved (React frontend, Flask backend; routes → services → validators → models).
- [x] **IV. AI Provider Abstraction**: Isolated behind AI service interface (Gemini & Grok supported; no API keys committed; mock fallback included).
- [x] **V. Security & Sessions**: Server-side session auth, hashed passwords, credentials in `.env`.
- [x] **VI. Brand Safety**: Deterministic checks (length, banned words) + semantic evaluation + auto-fix planned.
- [x] **VII. Persona Personalization**: Distinct marketing angles & hooks per persona (no simple rewriting).
- [x] **VIII. UX & States**: Approved design followed; transparent loading, success, failure, and auto-fix states.
- [x] **IX. REST API Design**: Standard REST endpoints with consistent JSON response envelopes and HTTP status codes (`contracts/`).
- [x] **X. Maintainability**: Single-responsibility components/functions, DRY, accessible to fresher-level devs.
- [x] **XI. Git Workflow**: Feature branch planned; PR-ready increments without breaking `main`.
- [x] **XII. MVP First**: End-to-end user journey prioritized over peripheral features.
- [x] **XIII. Hackathon Quality**: Demo-ready, clear problem-solution-value narrative addressing judging criteria.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-campaign-generator-mvp/
├── spec.md              # Feature specification & requirements
├── plan.md              # This implementation plan
├── research.md          # Architectural decisions & provider strategy
├── data-model.md        # Entities, validation constraints, and schemas
├── quickstart.md        # Validation walkthrough and run guide
├── checklists/
│   └── requirements.md  # Spec quality verification checklist
└── contracts/
    ├── auth.json        # Authentication REST contracts
    ├── presets.json     # Demo presets contract
    └── campaigns.json   # Generation, validation, auto-fix & export contracts
```

### Source Code Architecture

```text
backend/
├── app/
│   ├── __init__.py           # Flask app factory, CORS, and session initialization
│   ├── config.py             # App configuration and environment loading
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py           # User entity and password hashing
│   │   ├── brand_kit.py      # BrandKit entity and validation
│   │   ├── persona.py        # Persona & PersonaDNA entities
│   │   └── campaign.py       # CampaignConcept, Asset, Report, and Bundle
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py     # /api/auth (signup, login, logout, me)
│   │   ├── preset_routes.py   # /api/presets (1-click demo presets)
│   │   └── campaign_routes.py # /api/campaigns (dna, concepts, assets, auto-fix, export)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py      # BaseAIProvider interface + provider factory
│   │   ├── gemini_provider.py # Google Gemini API integration
│   │   ├── grok_provider.py   # xAI Grok API integration
│   │   ├── mock_provider.py   # Resilient offline/demo fallback provider
│   │   ├── brand_guardian.py  # Composite scoring & diagnostic orchestration
│   │   ├── storage_service.py # Atomic local JSON persistence
│   │   └── export_service.py  # Markdown and JSON export generator
│   └── validators/
│       ├── __init__.py
│       └── brand_rules.py     # Deterministic banned-word scanner & length validator
├── data/
│   ├── users.json            # User accounts
│   ├── brand_kits.json       # Persisted brand kits
│   ├── campaigns.json        # Persisted campaign bundles
│   └── sessions/             # Server-side filesystem sessions
├── tests/
│   ├── test_auth.py          # Registration, password hashing, session tests
│   ├── test_validators.py    # Deterministic banned word & length unit tests
│   ├── test_ai_service.py    # AI provider abstraction & mock fallback tests
│   ├── test_campaign_flow.py # End-to-end campaign generation & auto-fix tests
│   └── test_export.py        # Markdown and JSON export format tests
├── .env.example
├── requirements.txt
└── wsgi.py                   # Server entrypoint

frontend/
├── src/
│   ├── assets/               # Branding icons and hero assets
│   ├── components/
│   │   ├── Navbar.jsx               # Navigation bar with user status and logout
│   │   ├── LoadingIndicator.jsx     # Stage-aware asynchronous progress indicator
│   │   ├── BrandGuardianBadge.jsx   # Score display (0-100) with Pass/Warn/Fail badge
│   │   ├── ValidationReportCard.jsx # Dimension breakdown and itemized violations
│   │   ├── WhyThisContentModal.jsx  # Plain-language business explainability modal
│   │   ├── PresetSelector.jsx       # 1-click sample campaign loader
│   │   └── AssetCard.jsx            # Social post / Email card with Auto-Fix action
│   ├── pages/
│   │   ├── LandingPage.jsx          # Public hero page with features and CTA
│   │   ├── LoginPage.jsx            # User sign in form
│   │   ├── SignupPage.jsx           # User registration form
│   │   ├── DashboardPage.jsx        # User campaigns hub & recent activity
│   │   ├── BrandPersonaSetupPage.jsx# Brand Kit input & Persona selector
│   │   ├── StrategyConceptPage.jsx  # Persona DNA display & concept selection
│   │   └── CampaignResultsPage.jsx  # Asset generation, Brand Guardian, auto-fix, export
│   ├── services/
│   │   └── api.js                   # Axios HTTP client with credentials & error handling
│   ├── App.jsx                      # React Router configuration with protected routes
│   ├── main.jsx                     # Vite entry point
│   └── index.css                    # Tailwind CSS 4 theme and custom styles
├── tests/
│   ├── App.test.jsx                 # App routing & auth guard tests
│   └── CampaignFlow.test.jsx        # Complete generation and auto-fix UI tests
├── package.json
└── vite.config.js
```

---

## Complexity Tracking

| Principle / Gate | Deviation / Pattern | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|---|
| *None* | No constitutional violations | All 13 principles are strictly upheld | Standard modular architecture cleanly fits the MVP scope |
