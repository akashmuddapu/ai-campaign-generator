# CampaignGuard AI 🛡️

> **AI-powered marketing campaign studio with built-in Brand Guardian compliance, progressive 5-step workflow, draft resume, and dynamic Brand Kit-aligned Campaign Report Cards.**
> Generate persona-targeted social posts and marketing emails — validated against your brand rules in real time.

---

## 🎯 What Is This?

**CampaignGuard AI** is a full-stack AI marketing platform that guides marketers from Brand Kit setup to validated, launch-ready campaigns with zero prompt engineering required.

With CampaignGuard AI, marketers can:

1. **Define a Brand Kit & AI-Suggested Personas** — set product name, description, brand tone tags, tagline, banned words, and configure tailored customer personas (with 1-click AI **Suggest Personas** for any domain).
2. **Synthesize Persona Strategy (DNA)** — generate distinct goals, pain points, motivations, emotional triggers, and recommended angles per audience segment.
3. **Select Campaign Concepts** — choose from three AI-generated strategic campaign concepts with domain-aware icons, key messages, and hooks.
4. **Generate & Edit Personalized Assets** — produce unique social media posts (≤280 chars) and marketing emails (75–250 words) for each persona, with live inline editing and per-persona switching.
5. **Validate with Brand Guardian & Auto-Fix** — run deterministic banned-word, length, and 6-dimension compliance checks with 1-click remediation.
6. **Review Dynamic Campaign Report Card** — inspect real-time alignment with your active **Brand Kit** (brand mention, tone rules, banned words guardrail audit, channel specs), 5-dimension radar chart, executive letter grade (`A+`–`D`), multi-persona impact analysis, predicted engagement benchmarks, and 1-click **Improve Campaign**.
7. **Save Drafts & Resume Anytime** — save mid-flow drafts at any step (`Step 1`–`Step 5`) and resume directly where you left off after logging back in.
8. **Export Offline** — download complete campaign bundles as **PDF**, **Markdown (`.md`)**, or **JSON (`.json`)**.

---

## ✨ Key Features

| Feature | Description |
| --- | --- |
| 🧭 **Progressive 5-Step Flow** | Steps unlock sequentially in the sidebar as you progress (`Brand & Personas` → `Persona Strategy` → `Campaign Concepts` → `Campaign Assets` → `Brand Guardian` & `Report Card` → `Export`), with Previous/Next step controls on every screen. |
| 💾 **Draft Auto-Save, Reset & Resume** | Save drafts at any step (resets the studio sidebar cleanly back to Step 1). Saved drafts show amber `Draft • Step X/5` badges in the sidebar and Campaign History with 1-click resume to the exact step. |
| 🎯 **Dynamic Brand Kit-Aligned Report Card** | Live evaluation against your active Brand Kit: Brand Mention check, Brand Tone alignment pills, Banned Words Guardrail audit, Channel Compliance checks, 5-axis radar chart, executive grade (`A+`–`D`), multi-persona impact, predicted CTR/open rates, and a Campaign Switcher dropdown. |
| 🛡️ **Brand Guardian & Auto-Fix** | Deterministic word-boundary banned-word detection, channel length validation, 6-dimension compliance scoring, and 1-click AI remediation. |
| 👤 **Dynamic AI Personas & Concept Icons** | Domain-aware persona suggestions (`POST /api/campaigns/suggest-personas`), per-persona social & email tailoring, dynamic concept icons, and dynamic generation progress modal. |
| 🔒 **Strict Per-User History Isolation** | Flask session + `X-User-Id` isolation guarantees each user sees only their own campaigns and drafts, with per-persona asset previews and Quick Edit in Campaign History. |
| 🎨 **Collapsible Dark Sidebar** | Open/close sidebar toggle persisted in `localStorage`, sleek custom dark scrollbars, and pinned User Profile + Sign Out controls. |
| 🧠 **Pluggable AI Providers** | `Gemini → Grok → Mock` abstraction layer — runs seamlessly offline in Mock mode without API keys. |
| 📥 **Multi-Format Export** | Client-side **PDF** (`jsPDF`), **Markdown**, and **JSON** downloads plus backend export endpoints. |
| ⚡ **1-Click Sample Presets** | TravelMate Smart Mug, CyberShield Cloud, and ZenBrew presets with tailored personas. |

---

## 📋 Progressive 5-Step Campaign Studio Workflow

```text
Step 1 → Brand Kit & Personas (/generator)
         Define product name, description, brand tones, tagline, banned words,
         and customer personas (or click "Suggest Personas"). Save Draft or proceed.

Step 2 → Persona Strategy / DNA (/strategy-concept?step=dna)
         Review psychological profiles, goals, pain points, and hooks per persona.
         Unlocks "Persona Strategy" in the sidebar.

Step 3 → Campaign Concepts (/strategy-concept?step=concepts)
         Compare 3 strategic campaign directions with dynamic icons and hooks.
         Unlocks "Campaign Concepts" in the sidebar.

Step 4 → Campaign Assets (/results?tab=assets)
         Inspect, edit, regenerate, or explain ("Why this content?") persona-specific
         Social Posts and Marketing Emails. Unlocks "Campaign Assets" in the sidebar.

Step 5 → Brand Guardian & Campaign Report Card (/results?tab=guardian, /report-card)
         Audit 6-dimension compliance, run 1-click Auto-Fix, and review the dynamic
         Brand Kit-aligned Executive Report Card & 5-axis radar chart.

Export → Multi-Format Download (/results?tab=export)
         Download PDF, Markdown, or JSON bundles and click "Finish & Return Home"
         to reset the studio for your next campaign.
```

> **Note:** Clicking **Save Draft** at any step persists your draft to the backend, resets the sidebar back to Step 1, and lets you resume at that exact step from **Previous Campaigns** or **Campaign History**.

---

## 🏗️ Project Structure

```text
ai-campaign-generator/
├── frontend/                                   # React 19 + Vite 8 + Tailwind CSS 4
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BrandPersonaSetupPage.jsx       # Step 1: Brand Kit & AI Persona Setup
│   │   │   ├── StrategyConceptPage.jsx         # Steps 2 & 3: Persona DNA & Concepts
│   │   │   ├── CampaignResultsPage.jsx         # Steps 4 & 5: Assets, Brand Guardian & Export
│   │   │   ├── CampaignReportCardPage.jsx      # Dynamic Brand Kit-Aligned Report Card
│   │   │   └── CampaignHistoryReportPage.jsx   # User-Isolated History, Draft Resume & Quick Edit
│   │   ├── components/
│   │   │   ├── SidebarLayout.jsx               # Collapsible sidebar with progressive step unlocking
│   │   │   ├── AssetCard.jsx
│   │   │   ├── BrandGuardianBadge.jsx
│   │   │   ├── WhyThisContentModal.jsx
│   │   │   ├── PresetSelector.jsx
│   │   │   ├── ValidationReportCard.jsx
│   │   │   ├── CampaignRadarChart.jsx          # 5-axis SVG radar chart
│   │   │   ├── ExecutiveGradeBanner.jsx        # Letter grade & launch readiness banner
│   │   │   ├── ScoreBreakdownGrid.jsx          # 5-category score cards
│   │   │   ├── PersonaImpactCard.jsx           # Multi-persona impact analysis
│   │   │   ├── PredictedPerformanceCard.jsx    # Forecasted CTR, open rate & engagement
│   │   │   ├── AIInsightsPanel.jsx             # Brand-Kit-aligned strengths & recommendations
│   │   │   └── ImprovementDrawerModal.jsx      # 1-click improvement & re-score drawer
│   │   ├── services/
│   │   │   └── api.js                          # Axios client with session cookies & X-User-Id
│   │   └── utils/
│   │       ├── wizardProgress.js               # Progressive step unlocking & draft reset helpers
│   │       └── generateCampaignPdf.js          # Client-side PDF report generator
│   └── tests/                                  # 31 Vitest + React Testing Library tests
│       ├── api.test.js
│       ├── Auth.test.jsx
│       ├── CampaignFlow.test.jsx
│       ├── CampaignReportCard.test.jsx
│       ├── LoadingIndicator.test.jsx
│       ├── Navbar.test.jsx
│       ├── WhyThisContentModal.test.jsx
│       └── WizardProgress.test.jsx
│
├── backend/                                    # Python Flask 3.1 REST API
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth_routes.py                  # Signup, login, logout, session check
│   │   │   ├── campaign_routes.py              # Drafts, persona suggest, DNA, concepts, assets, history
│   │   │   ├── report_card_routes.py           # Saved & live Brand Kit report card evaluation & improve
│   │   │   └── preset_routes.py                # Sample brand kit presets
│   │   ├── services/
│   │   │   ├── ai_service.py                   # Provider abstraction (Gemini -> Grok -> Mock)
│   │   │   ├── gemini_provider.py
│   │   │   ├── grok_provider.py
│   │   │   ├── mock_provider.py
│   │   │   ├── brand_guardian.py               # 6-dimension deterministic + semantic validator
│   │   │   ├── report_card_service.py          # Dynamic Brand Kit alignment & 5-axis scoring engine
│   │   │   ├── performance_forecast_service.py # Channel performance prediction engine
│   │   │   ├── export_service.py
│   │   │   └── storage_service.py
│   │   ├── models/
│   │   │   └── report_card.py                  # ReportCard & BrandKitAlignment dataclasses
│   │   └── validators/
│   ├── data/
│   ├── tests/                                  # 91 Pytest tests
│   ├── requirements.txt
│   └── wsgi.py
│
└── specs/
    ├── 001-campaign-generator-mvp/
    └── 002-campaign-report-card/
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.11
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

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `backend/.env` (API keys are optional — Mock mode works out of the box):

```env
SECRET_KEY=your-super-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key
```

### 4. Start Backend & Frontend

**Terminal 1 — Backend (`http://localhost:5000`):**

```bash
cd backend
python wsgi.py
```

**Terminal 2 — Frontend (`http://localhost:5173`):**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Tests

### Backend Tests (91 tests)

```bash
.\backend\.venv\Scripts\pytest -q
```

### Frontend Tests (31 tests)

```bash
npm --prefix frontend test -- --run
```

### Production Build Check

```bash
npm --prefix frontend run build
```

---

## 🌐 API Reference

All API endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate a user |
| `POST` | `/auth/logout` | End the current session |
| `GET` | `/auth/me` | Get the current authenticated user |

### Campaigns & Drafts

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/campaigns/suggest-personas` | Suggest domain-tailored customer personas for a product |
| `POST` | `/campaigns/draft` | Create or update an in-progress campaign draft (`status: "Draft"`, `current_step`) |
| `POST` | `/campaigns/persona-dna` | Synthesize persona psychological DNA |
| `POST` | `/campaigns/concepts` | Generate three strategic campaign concepts |
| `POST` | `/campaigns/generate-assets` | Generate social posts & emails, validate with Brand Guardian, and finalize draft |
| `POST` | `/campaigns/auto-fix` | Remediate brand compliance violations |
| `GET` | `/campaigns` | List authenticated user's saved campaigns and drafts |
| `GET` | `/campaigns/<id>` | Retrieve full campaign or draft detail |
| `PUT` | `/campaigns/<id>` | Update campaign details or Quick Edit copy |
| `DELETE` | `/campaigns/<id>` | Delete a campaign or draft |
| `GET` | `/campaigns/export/<id>` | Export a campaign as Markdown or JSON |

### Campaign Report Card

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/campaigns/<id>/report-card` | Synthesize Brand Kit-aligned 5-axis report card & forecast for a saved campaign |
| `POST` | `/campaigns/report-card/evaluate` | Dynamically evaluate a live Brand Kit, Personas, Concept & Assets payload |
| `POST` | `/campaigns/<id>/report-card/improve` | Generate prioritized Brand Kit-aligned improvement suggestions |
| `POST` | `/campaigns/<id>/report-card/apply-improvements` | Auto-remediate weaker assets and re-score the report card |

### Presets

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/presets` | List sample brand kit presets (`TravelMate`, `CyberShield`, `ZenBrew`) |
| `GET` | `/presets/<id>` | Retrieve a specific preset |

---

## 🎨 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide React, jsPDF |
| Frontend Testing | Vitest, React Testing Library |
| Backend | Python 3.11+, Flask 3.1, Flask-Session, Flask-CORS, Pydantic |
| AI Providers | Google Gemini API, xAI Grok API, Deterministic Mock Provider |
| Backend Testing | Pytest |

---

## 🔐 Environment Variables (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `SECRET_KEY` | Yes | Flask session signing key |
| `GEMINI_API_KEY` | No | Google Gemini API key (optional; falls back to Grok/Mock) |
| `GROK_API_KEY` | No | xAI Grok API key (optional; falls back to Mock) |
| `SESSION_TYPE` | No | Flask-Session backend (defaults to `filesystem`) |

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

Open a Pull Request to merge your changes. Please follow the engineering principles documented in `.specify/memory/constitution.md`.

---

<p align="center">Built with ❤️ using React, Flask, Google Gemini AI, and Antigravity.</p>
