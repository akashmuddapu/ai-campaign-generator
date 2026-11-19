# CampaignGuard AI 🛡️

<p align="left">
  <img alt="React 19" src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Flask 3.1" src="https://img.shields.io/badge/Backend-Flask%203.1%20(Python)-000000?style=flat-square&logo=flask&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Tests Passing" src="https://img.shields.io/badge/Tests-128%20Passing%20(97%20Backend%20%2B%2031%20Frontend)-10B981?style=flat-square" />
  <img alt="Synthetic Data" src="https://img.shields.io/badge/Data-100%25%20Synthetic-7C3AED?style=flat-square" />
</p>

> **Enterprise-grade AI Marketing Campaign Studio with Closed-Loop Brand Governance.**
> Transform a Brand Kit and customer personas into genuinely tailored campaign concepts, social posts, marketing emails, and commercial ad visuals — deterministically validated, automatically repaired, scored against your Brand Kit, and ready for multi-format export.

---

## Executive Summary

Generating marketing copy with a generic chatbot is easy; generating **brand-safe, persona-specific, channel-compliant, and audit-ready** campaigns at scale is the real challenge. **CampaignGuard AI** solves this with a closed-loop workflow:

```text
Generate ──► Validate (Code + AI) ──► Auto-Fix Loop ──► Revalidate ──► Explain ──► Report Card ──► Export & Ad Studio
```

- **Hard rules in deterministic Python code:** Exact word-boundary banned-word detection, hashtag count & policy validation, social character limits (`≤ 280 chars`), email subject limits (`≤ 60 chars`), and email body bounds (`75–250 words`).
- **Soft brand judgment in AI:** Semantic Brand Fit, Persona Fit, Channel Fit, and transparent *"Why This Content?"* explanations.
- **Zero prompt engineering required:** Every step uses a dedicated, isolated prompt inside a progressive guided studio.

---

## Key Capabilities

| Capability | Description |
| --- | --- |
| 🧭 **Progressive 5-Step Guided Studio** | Steps unlock sequentially in the sidebar as you progress (`Brand & Personas` → `Persona Strategy` → `Campaign Concepts` → `Campaign Assets` → `Brand Guardian` & `Report Card` → `Export` & `Generate Ad`), with Previous/Next step controls on every screen. |
| 💾 **Draft Auto-Save, Reset & Exact-Step Resume** | Save drafts at any step (`POST /api/campaigns/draft`). Saving resets the active workspace cleanly while preserving a `Draft • Step X/5` entry in the sidebar and Campaign History that resumes at the exact step after re-login. |
| 👤 **True Persona Differentiation & AI Suggestion** | Builds distinct psychological Persona DNA (goals, pain points, motivations, emotional triggers) so each segment receives a unique angle—not reworded copy. Includes 1-click **AI Suggest Personas** (`POST /api/campaigns/suggest-personas`) and domain-aware concept icons for any product. |
| 🛡️ **Brand Guardian & Automatic Auto-Fix Loop** | 6-dimension compliance validator combining deterministic Python rules (banned words, lengths, hashtags) and AI semantic scoring. Failing assets trigger an automatic 1-pass closed-loop Auto-Fix before delivery, plus on-demand 1-click remediation. |
| 🎯 **Dynamic Brand Kit-Aligned Report Card** | Live evaluation (`POST /api/campaigns/report-card/evaluate`) showing Brand Mention verification, Brand Tone alignment pills, per-word Banned Words Guardrail audit, Channel Compliance checks, 5-axis SVG radar chart, executive grade (`A+`–`D`), multi-persona impact, predicted engagement benchmarks, and a Campaign Switcher dropdown. |
| 🖼️ **AI Image Ad Creative Studio** | Generate commercial marketing visuals tailored to each persona (`POST /api/campaigns/generate-ad-image` & `/generate-ad-hooks`) across `1:1`, `16:9`, and `9:16` formats, 4 visual styles, optional canvas headline/CTA overlay, and 1-click **JPG / PNG** downloads. |
| 💡 **Explainable AI ("Why This Content?")** | Every social post and marketing email includes a dedicated rationale drawer explaining persona, brand voice, and channel alignment. |
| 🔒 **Per-User Isolated History & Auth** | Flask server-side sessions + `X-User-Id` isolation ensure users only see their own campaigns and drafts, with Quick Edit, executive audit reports, clean icon-only sidebar toggle, and logout redirect to the Landing Page. |
| 🧠 **Resilient AI Provider Abstraction** | Pluggable `BaseAIProvider` failover chain (`Gemini → Grok → Mock`) ensures graceful degradation on rate limits or outages and 100% deterministic offline demos/testing. |
| 📥 **Offline Multi-Format Export** | Download complete campaign packages as **PDF** (`jsPDF`), **Markdown (`.md`)**, and **JSON (`.json`)**. |

---

## System Architecture

```text
                       [ React 19 + Tailwind CSS 4 Frontend Studio ]
                   (5-Step Wizard • Draft Resume • Report Card • Ad Studio)
                                             │
                                    REST / JSON + Session
                                             ▼
                           [ Flask 3.1 REST API & Orchestrator ]
                       (Auth • Campaigns & Drafts • Report Card • Presets)
                                             │
                 ┌───────────────────────────┼───────────────────────────┐
                 ▼                           ▼                           ▼
       [ AI Provider Layer ]        [ Brand Guardian ]         [ Report Card Engine ]
       BaseAIProvider               • Python Rules: Banned     • Brand Kit Alignment
        ├─ Gemini (Primary)           Words, Lengths, Hashtags • 5-Axis Grade & Radar
        ├─ Grok   (Fallback)        • AI Semantic 6-Dim Score  • Channel Forecast
        └─ Mock   (Test/Demo)                │                           │
                 │                           ▼                           ▼
                 │                 [ Validation Decision ]     [ Executive Review ]
                 │                  ├─ Violation ──► Auto-Fix ──► Revalidate
                 └────────────────► └─ Compliant ──► Explain ──► Export / Ad Image
                                             │
                                             ▼
                                 [ Storage Service Layer ]
                  Per-User Isolated JSON Persistence (Swappable → PostgreSQL)
```

### Architectural Decisions

| Option Considered | Verdict | Rationale |
| --- | :---: | --- |
| **Direct LLM Wrapper** | Rejected | Lacks deterministic compliance, banned-word guarantees, and closed-loop repair. |
| **RAG Pipeline** | Deferred (Phase 2) | Core MVP focuses on structured generation + governance rather than large-document retrieval; cleanly extensible later. |
| **Multi-Agent Orchestration** | Rejected for MVP | Introduces higher LLM call volume, latency, cost, and debugging complexity without improving guardrail determinism. |
| **Modular AI + Validation Pipeline** | **Selected** | Clean one-prompt-per-step isolation with exact Python guardrails + AI semantic scoring + automatic Auto-Fix loop. |
| **Service-Abstracted JSON Storage** | **Selected (MVP)** | Accelerates MVP delivery while keeping storage decoupled behind `storage_service.py` for zero-redesign PostgreSQL migration. |

---

## Guided Campaign Studio Workflow

1. **Step 1 — Brand Kit & Personas (`/generator`)**  
   Configure product name, description, tone tags, tagline, banned words, and customer personas (or load TravelMate Smart Mug, CyberShield Cloud, or ZenBrew presets, or click **Suggest Personas**).
2. **Step 2 — Persona Strategy / DNA (`/strategy-concept?step=dna`)**  
   Inspect generated psychological profiles, goals, pain points, and recommended angles per audience segment.
3. **Step 3 — Campaign Concepts (`/strategy-concept?step=concepts`)**  
   Compare 3 distinct strategic directions with domain-aware icons, key messages, and hooks.
4. **Step 4 — Campaign Assets (`/results?tab=assets`)**  
   Review side-by-side Social Posts and Marketing Emails per persona, edit inline, regenerate on demand, or inspect *"Why This Content?"*.
5. **Step 5 — Brand Guardian & Report Card (`/results?tab=guardian`, `/report-card`)**  
   Audit 6-dimension scores, run 1-click Auto-Fix, and review the dynamic Brand Kit-aligned Executive Report Card & 5-axis radar chart.
6. **Export & AI Image Ad Studio (`/results?tab=export`, `/results?tab=ad`)**  
   Download **PDF / Markdown / JSON** bundles, generate persona-tailored **JPG / PNG** commercial image ads, and click **Finish & Return Home** to reset the studio.

---

## Project Structure

```text
ai-campaign-generator/
├── frontend/                                   # React 19 + Vite 8 + Tailwind CSS 4
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx                 # Public product landing page
│   │   │   ├── LoginPage.jsx / SignupPage.jsx  # Authentication views
│   │   │   ├── DashboardPage.jsx               # Workspace home & draft notices
│   │   │   ├── BrandPersonaSetupPage.jsx       # Step 1: Brand Kit & AI Persona Setup
│   │   │   ├── StrategyConceptPage.jsx         # Steps 2 & 3: Persona DNA & Concepts
│   │   │   ├── CampaignResultsPage.jsx         # Steps 4–5: Assets, Guardian, Export & Ad Studio
│   │   │   ├── CampaignReportCardPage.jsx      # Dynamic Brand Kit-Aligned Report Card
│   │   │   └── CampaignHistoryReportPage.jsx   # Isolated History, Draft Resume & Quick Edit
│   │   ├── components/
│   │   │   ├── SidebarLayout.jsx               # Progressive sidebar with icon toggle & draft badges
│   │   │   ├── Navbar.jsx
│   │   │   ├── AssetCard.jsx
│   │   │   ├── BrandGuardianBadge.jsx
│   │   │   ├── WhyThisContentModal.jsx
│   │   │   ├── PresetSelector.jsx
│   │   │   ├── ValidationReportCard.jsx
│   │   │   ├── CampaignRadarChart.jsx          # 5-axis SVG radar chart
│   │   │   ├── ExecutiveGradeBanner.jsx        # Letter grade & launch readiness banner
│   │   │   ├── ScoreBreakdownGrid.jsx          # 5-category score breakdown
│   │   │   ├── PersonaImpactCard.jsx           # Multi-persona impact analysis
│   │   │   ├── PredictedPerformanceCard.jsx    # Forecasted CTR, open rate & engagement
│   │   │   ├── AIInsightsPanel.jsx             # Brand-Kit-aligned strengths & insights
│   │   │   └── ImprovementDrawerModal.jsx      # 1-click improvement & re-score drawer
│   │   ├── services/api.js                     # Axios client (session cookies + X-User-Id)
│   │   └── utils/
│   │       ├── wizardProgress.js               # Progressive step unlocking & draft reset manager
│   │       └── generateCampaignPdf.js          # Client-side PDF export generator
│   └── tests/                                  # 31 Vitest + React Testing Library tests
│
├── backend/                                    # Python 3.11+ Flask 3.1 REST API
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth_routes.py                  # Auth & session lifecycle
│   │   │   ├── campaign_routes.py              # Drafts, personas, concepts, assets, ad images, history
│   │   │   ├── report_card_routes.py           # Saved & live Brand Kit report card evaluation
│   │   │   └── preset_routes.py                # Synthetic sample brand kits
│   │   ├── services/
│   │   │   ├── ai_service.py                   # Provider abstraction (Gemini -> Grok -> Mock)
│   │   │   ├── gemini_provider.py
│   │   │   ├── grok_provider.py
│   │   │   ├── mock_provider.py
│   │   │   ├── brand_guardian.py               # 6-dimension hybrid deterministic + AI validator
│   │   │   ├── report_card_service.py          # Brand Kit alignment & 5-axis scoring engine
│   │   │   ├── performance_forecast_service.py # Channel forecast engine
│   │   │   ├── export_service.py               # Markdown & JSON serializers
│   │   │   └── storage_service.py              # Swappable persistence layer
│   │   ├── models/report_card.py               # ReportCard & BrandKitAlignment dataclasses
│   │   └── validators/brand_rules.py           # Deterministic banned-word, length & hashtag rules
│   ├── tests/                                  # 97 Pytest tests
│   ├── .env.example
│   ├── requirements.txt
│   └── wsgi.py
│
└── specs/
    ├── 001-campaign-generator-mvp/
    └── 002-campaign-report-card/
```

---

## Quick Start

### Prerequisites
- **Node.js** `>= 20`
- **Python** `>= 3.11`
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/akashmuddapu/ai-campaign-generator.git
cd ai-campaign-generator
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:
- **Windows (PowerShell):** `.venv\Scripts\activate`
- **macOS / Linux:** `source .venv/bin/activate`

Install dependencies and configure environment:
```bash
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` (API keys are optional — Mock mode runs out of the box):
```env
SECRET_KEY=replace-with-a-strong-secret-key
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key
```

Start the Flask API (`http://localhost:5000`):
```bash
python wsgi.py
```

### 3. Frontend Setup
Open a second terminal from the repository root:
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## Testing & Verification

| Suite | Command | Coverage |
| --- | --- | --- |
| **Backend (97 tests)** | `.\backend\.venv\Scripts\pytest -q` | Auth, deterministic validators (banned words, lengths, hashtags), Brand Guardian, automatic & manual Auto-Fix, persona differentiation, drafts, ad images/hooks, dynamic Brand Kit Report Card, export. |
| **Frontend (31 tests)** | `npm --prefix frontend test -- --run` | Auth, Navbar, Campaign Flow, progressive sidebar unlocking & draft reset, dynamic Brand Kit Report Card, modals, API client. |
| **Production Build** | `npm --prefix frontend run build` | Verified clean Vite 8 bundle compilation. |

---

## API Reference (`/api`)

### Authentication
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Register a new user account |
| `POST` | `/auth/login` | Authenticate user and initialize session |
| `POST` | `/auth/logout` | Terminate session |
| `GET` | `/auth/me` | Retrieve authenticated user profile |

### Campaigns, Drafts & Ad Studio
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/campaigns/suggest-personas` | Suggest domain-tailored customer personas for any product |
| `POST` | `/campaigns/draft` | Save or update an in-progress draft (`status: "Draft"`, `current_step`) |
| `POST` | `/campaigns/persona-dna` | Synthesize persona psychological DNA |
| `POST` | `/campaigns/concepts` | Generate 3 strategic campaign concepts |
| `POST` | `/campaigns/generate-assets` | Generate social post & email, run Brand Guardian + automatic 1-pass Auto-Fix loop |
| `POST` | `/campaigns/auto-fix` | Remediate compliance violations and re-validate |
| `POST` | `/campaigns/generate-ad-hooks` | Generate Brand Kit-safe, persona-tailored ad headline hooks |
| `POST` | `/campaigns/generate-ad-image` | Synthesize high-resolution commercial ad image payload |
| `GET` | `/campaigns` | List authenticated user's saved campaigns and drafts |
| `GET` / `PUT` / `DELETE` | `/campaigns/<id>` | Retrieve, quick-edit, or delete a campaign or draft |
| `GET` | `/campaigns/export/<id>` | Download campaign export (`?format=markdown` or `?format=json`) |

### Dynamic Campaign Report Card
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/campaigns/<id>/report-card` | Synthesize Brand Kit-aligned 5-axis report card & forecast |
| `POST` | `/campaigns/report-card/evaluate` | Dynamically evaluate live Brand Kit, Personas, Concept & Assets |
| `POST` | `/campaigns/<id>/report-card/improve` | Generate prioritized Brand Kit-aligned improvement suggestions |
| `POST` | `/campaigns/<id>/report-card/apply-improvements` | Auto-remediate weaker assets and re-score the report card |

### Presets
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/presets` | List synthetic sample brand kits (`TravelMate`, `CyberShield`, `ZenBrew`) |
| `GET` | `/presets/<id>` | Retrieve a specific preset |

---

## Security & Data Compliance

- **No Committed Secrets:** `.env` and `.env.*` are excluded via `.gitignore`; only `.env.example` is tracked.
- **100% Synthetic Data:** All presets, fixtures, and demo personas are synthetic (`TravelMate Smart Mug`, `CyberShield Cloud`, `ZenBrew`). No real customer, employee, or company data is stored or used.
- **User Workspace Isolation:** Campaign history and drafts are strictly scoped per authenticated user.

---

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide React, jsPDF, Vitest, React Testing Library
- **Backend:** Python 3.11+, Flask 3.1, Flask-Session, Flask-CORS, Pydantic, Pytest
- **AI Layer:** Google Gemini API, xAI Grok API, Deterministic Mock Provider

---

<p align="center">Built with ❤️ using React, Flask, Google Gemini AI, and Antigravity.</p>
