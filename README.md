# CampaignGuard AI 🛡️

> **AI-powered marketing campaign generator with built-in brand compliance.**  
> Generate persona-targeted social posts and emails — validated against your brand rules in real time.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.1-black?logo=flask)](https://flask.palletsprojects.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-22%20tests-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Pytest](https://img.shields.io/badge/Pytest-85%20tests-0a9edc?logo=pytest&logoColor=white)](https://pytest.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 What Is This?

**CampaignGuard AI** is a full-stack MVP that lets marketers:

1. **Define a Brand Kit** — product name, description, tone tags, tagline, and banned words
2. **Configure Customer Personas** — Student, Working Professional, Traveller, or custom
3. **Generate Campaign Concepts** — AI picks 3 strategic angles with hooks and key messages
4. **Get Personalized Assets** — unique social posts (≤280 chars) and emails (75–250 words) per persona
5. **Run Brand Guardian** — validates every asset against your rules (banned words, length, tone)
6. **Auto-Fix Violations** — one-click remediation brings compliance to 100%
7. **Export** — download the full campaign as `.md` or `.json`

All in a 5-step guided studio — no AI prompt engineering required.

---

## 📸 App Screenshots

| Step 1 — Brand Kit & Personas | Step 4 — Campaign Assets |
|-------------------------------|--------------------------|
| Define product, tone, banned words, and personas | Per-persona social posts and emails with Edit/Regenerate/Auto-Fix |

| Step 5 — Brand Guardian | Export |
|-------------------------|--------|
| Asset-wise compliance table with auto-fix | Download full campaign as Markdown or JSON |

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Provider Abstraction** | Pluggable Gemini / Grok / Mock providers — swap without changing business logic |
| 🛡️ **Brand Guardian** | Deterministic banned-word detection + length rules + semantic score (1–5 per asset) |
| ⚡ **Auto-Fix Engine** | Replaces banned words, trims over-length content across all personas in one click |
| 👤 **Persona DNA** | Each persona gets genuinely different copy — not just name substitution |
| 📥 **Offline Export** | Client-side Markdown and JSON download — works even without backend |
| 🕒 **Campaign History** | Previous campaigns in sidebar with executive report + quick-edit mode |
| 🔐 **Auth System** | Server-side Flask sessions with password hashing |
| 📊 **Live Validation** | Brand score tiles update in real-time as you edit content |
| 🎨 **Sample Presets** | TravelMate, CyberShield, ZenBrew — load instantly to demo the app |

---

## 🏗️ Project Structure

```
ai-campaign-generator/
├── frontend/                   # React 19 + Vite + Tailwind CSS 4
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx             # Public marketing page
│   │   │   ├── LoginPage.jsx               # Auth form
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx           # Campaign workspace home
│   │   │   ├── BrandPersonaSetupPage.jsx   # Step 1 — Brand Kit & Personas
│   │   │   ├── StrategyConceptPage.jsx     # Step 2+3 — Concepts
│   │   │   ├── CampaignResultsPage.jsx     # Step 4+5 — Assets + Guardian + Export
│   │   │   └── CampaignHistoryReportPage.jsx  # History & reports
│   │   ├── components/
│   │   │   ├── SidebarLayout.jsx           # Persistent sidebar navigation
│   │   │   ├── AssetCard.jsx               # Social/Email card with inline edit
│   │   │   ├── BrandGuardianBadge.jsx      # Compliance score badge
│   │   │   ├── WhyThisContentModal.jsx     # AI explainability drawer
│   │   │   ├── PresetSelector.jsx          # Sample preset loader
│   │   │   └── ValidationReportCard.jsx    # Guardian score table
│   │   └── services/
│   │       └── api.js                      # Axios client with error interceptor
│   └── tests/                              # 22 Vitest + RTL tests
│
├── backend/                    # Python Flask REST API
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth_routes.py              # /api/auth — login, signup, logout, me
│   │   │   ├── campaign_routes.py          # /api/campaigns — full campaign pipeline
│   │   │   └── preset_routes.py            # /api/presets — sample brand kits
│   │   ├── services/
│   │   │   ├── ai_service.py               # Provider selection logic
│   │   │   ├── gemini_provider.py          # Google Gemini API integration
│   │   │   ├── grok_provider.py            # xAI Grok API integration
│   │   │   ├── mock_provider.py            # Offline/demo fallback provider
│   │   │   ├── brand_guardian.py           # Compliance engine
│   │   │   ├── export_service.py           # Markdown & JSON export
│   │   │   └── storage_service.py          # Campaign persistence
│   │   ├── models/                         # Pydantic data models
│   │   └── validators/                     # Brand rule validators
│   ├── data/                               # JSON file-based data store
│   ├── tests/                              # 85 Pytest unit tests
│   └── wsgi.py                             # Flask entry point
│
└── specs/001-campaign-generator-mvp/       # Spec-Driven Development artifacts
    ├── spec.md                             # Feature specification
    ├── plan.md                             # Architecture & design decisions
    ├── tasks.md                            # Implementation task list
    └── contracts/                          # API contracts (JSON)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.11
- **Git**

### 1. Clone the repo

```bash
git clone https://github.com/akashmuddapu/ai-campaign-generator.git
cd ai-campaign-generator
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
SECRET_KEY=your-super-secret-key-here
GEMINI_API_KEY=your-gemini-api-key         # Optional — app works without it (mock mode)
GROK_API_KEY=your-grok-api-key             # Optional
```

Start the backend:

```bash
python wsgi.py
# → Running on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

> **No API keys?** The app runs in Mock mode automatically — all AI responses use deterministic fallback data so you can explore the full workflow without any external dependencies.

---

## 🤖 AI Setup (Optional)

The app uses an **AI Provider Abstraction Layer** — it tries providers in order and falls back gracefully:

```
Gemini → Grok → Mock (always works)
```

### Get a Gemini API key (free tier available)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create a project → Get API key
3. Add to `backend/.env` as `GEMINI_API_KEY=...`

> The current working model is `gemini-3.8-flash` — older model names (1.5-flash, 2.0-flash) are deprecated.

---

## 🧪 Running Tests

### Backend (Pytest — 85 tests)

```bash
cd backend
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

pytest -q
# 85 passed, 75 warnings
```

### Frontend (Vitest — 22 tests)

```bash
npm --prefix frontend test
# 22 passed in 6 files
```

---

## 🌐 API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login and create session |
| `POST` | `/auth/logout` | Clear session |
| `GET` | `/auth/me` | Get current authenticated user |

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/campaigns/persona-dna` | Generate persona psychological profile |
| `POST` | `/campaigns/concepts` | Generate 3 campaign concept options |
| `POST` | `/campaigns/generate-assets` | Generate social post + email for a persona |
| `POST` | `/campaigns/auto-fix` | Remediate a single asset for brand compliance |
| `POST` | `/campaigns/validate` | Run Brand Guardian on existing assets |
| `GET` | `/campaigns` | List user's campaign history |
| `GET` | `/campaigns/<id>` | Get a full campaign bundle |
| `PUT` | `/campaigns/<id>` | Update campaign data |
| `DELETE` | `/campaigns/<id>` | Delete a campaign |
| `GET` | `/campaigns/export/<id>` | Export as `?format=markdown` or `?format=json` |

### Presets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/presets` | List available sample brand kits |
| `GET` | `/presets/<id>` | Get a specific preset |

---

## 🎨 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 19 |
| **Build Tool** | Vite | 8 |
| **Styling** | Tailwind CSS | 4 |
| **Routing** | React Router | 7 |
| **HTTP Client** | Axios | 1.21 |
| **Icons** | Lucide React | 1.75 |
| **Frontend Tests** | Vitest + React Testing Library | 5 |
| **Backend Framework** | Flask | 3.1 |
| **Sessions** | Flask-Session | 0.8 |
| **CORS** | Flask-CORS | 6 |
| **HTTP (backend)** | httpx2 | — |
| **AI SDK** | openai (Gemini-compatible) | 3.55 |
| **Data Validation** | Pydantic | 2 |
| **Backend Tests** | Pytest | 9.2 |

---

## 🔐 Environment Variables

### `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✅ Yes | Flask session secret (any random string) |
| `GEMINI_API_KEY` | ⬜ Optional | Google Gemini API key for real AI generation |
| `GROK_API_KEY` | ⬜ Optional | xAI Grok API key (alternative AI provider) |
| `SESSION_TYPE` | ⬜ Optional | Defaults to `filesystem` |

---

## 📋 5-Step Studio Workflow

```
Step 1 → Brand Kit & Personas
         Enter product name, description, brand tone tags,
         tagline, banned words, and define 1–5 customer personas

Step 2 → Persona DNA
         AI generates a psychological profile for each persona
         (goals, pain points, motivations, preferred tone)

Step 3 → Campaign Concepts
         Choose from 3 AI-generated strategic angles,
         each with a headline hook and core message

Step 4 → Campaign Assets
         View persona-specific social posts and emails
         Edit inline, Regenerate, or Auto-Fix individual assets
         Switch between personas with the tab switcher

Step 5 → Brand Guardian + Export
         Review asset-wise compliance table (score, status, issues)
         Run Brand Auto-Fix across all assets
         Export the complete campaign as .md or .json
```

---

## 🗂️ Campaign History

After generating a campaign, it appears in the **left sidebar** under "Previous Campaigns". Clicking any campaign opens:

- **Executive Report** — full brand kit, concept strategy, personas, all copy, Brand Guardian score table
- **Quick Edit Mode** — in-place editing of product name, tagline, social copy, and email
- **Resume in Studio** — preloads campaign state back into the 5-step generator
- **Export buttons** — Markdown and JSON download

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow the engineering principles in [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

---

## 📄 License

MIT © 2026 [Akash Muddapu](https://github.com/akashmuddapu)

---

<p align="center">
  Built with ❤️ using React, Flask, and Google Gemini AI
</p>
