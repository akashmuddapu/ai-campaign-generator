# 🛡️ CampaignGuard AI

<p align="left">
  <img alt="React 19" src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Flask 3.1" src="https://img.shields.io/badge/Backend-Flask%203.1%20(Python)-000000?style=flat-square&logo=flask&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Tests Passing" src="https://img.shields.io/badge/Tests-142%20Passing-10B981?style=flat-square" />
</p>

> **AI Marketing Campaign Studio with Built-In Brand Governance.**  
> Turn a Brand Kit and target personas into tailored campaign concepts, social posts, marketing emails, compliance report cards, and downloadable JPG/PNG ad visuals.

---

## Overview

**CampaignGuard AI** combines structured AI generation with deterministic Python guardrails so every marketing asset stays on-brand, persona-specific, and channel-compliant—without requiring manual prompt engineering.

```text
Generate ──► Validate (Rules + AI) ──► Auto-Fix ──► Report Card & Export ──► Ad Image Studio (JPG/PNG)
```

---

## Key Features

- **🧭 6-Step Guided Studio:** Progress step-by-step from Brand Kit setup to final ad image generation, with draft auto-save (`Draft • Step X/5`) and exact-step resume.
- **👤 Persona-Driven Strategy:** Generate distinct psychological profiles (goals, pain points, motivations) or use 1-click **AI Suggest Personas** so every audience segment gets tailored messaging.
- **🛡️ Brand Guardian & Auto-Fix:** Enforces hard rules in Python (banned words, character limits, hashtag counts) alongside AI semantic scoring, automatically repairing violations in a closed loop.
- **💡 Explainable AI:** Every post and email includes a *"Why This Content?"* breakdown explaining brand, persona, and channel alignment.
- **📊 Dynamic Report Card:** Evaluates brand tone, banned-word compliance, and predicted channel engagement with an executive letter grade (`A+`–`D`) and 5-axis radar chart.
- **🖼️ Step 6 — Ad Campaign Image Studio:** Generates persona-tailored commercial ad visuals across multiple aspect ratios (`1:1`, `16:9`, `9:16`) with customizable overlays and 1-click **JPG / PNG** export.
- **🔐 Secure Authentication:** Strict `.com` email validation, real-time password strength enforcement, and client-side salted SHA-256 hashing so plain-text passwords never travel over the network.
- **📥 Multi-Format Campaign Export:** Download full campaign packages as **PDF**, **Markdown (`.md`)**, or **JSON (`.json`)**.
- **🧠 Resilient AI Failover:** Pluggable provider chain (`Gemini → Grok → Mock`) ensures reliable uptime and instant offline demos/testing.

---

## 6-Step Studio Workflow

1. **Step 1 — Brand Kit & Personas (`/generator`)**  
   Define your product, brand tone, tagline, banned words, and target personas (or load sample presets / click **Suggest Personas**).
2. **Step 2 — Persona Strategy (`/strategy-concept?step=dna`)**  
   Review generated goals, pain points, and messaging angles tailored to each customer segment on a single scrollable page.
3. **Step 3 — Campaign Concepts (`/strategy-concept?step=concepts`)**  
   Compare 3 strategic campaign directions complete with key messages and hooks.
4. **Step 4 — Campaign Assets (`/results?tab=assets`)**  
   Review side-by-side Social Posts (`Post Content` + `Hashtags`) and Marketing Emails (`Subject Line` + `Email Body`) for every persona on a single scrollable page, edit inline, or inspect *"Why This Content?"*.
5. **Step 5 — Brand Guardian, Report Card & Export (`/results?tab=guardian`, `/report-card`)**  
   Audit compliance scores, run 1-click Auto-Fix, inspect your Brand Kit Report Card, and export campaign packages as **PDF**, **Markdown**, or **JSON**.
6. **Step 6 — Ad Campaign Image Generation (`/results?tab=ad`)**  
   Generate commercial ad visuals tailored to each persona across **`1:1`**, **`16:9`**, and **`9:16`** formats, choose from 4 visual styles, customize headline/CTA overlays, and download high-resolution **JPG** or **PNG** creatives.

---

## Architecture & Tech Stack

```text
[ React 19 + Tailwind CSS 4 Studio ] ──► REST / JSON ──► [ Flask 3.1 API ]
                                                                │
                          ┌─────────────────────────────────────┼─────────────────────────────────────┐
                          ▼                                     ▼                                     ▼
               [ AI Provider Chain ]                 [ Brand Guardian & Rules ]           [ Storage & Export ]
               Gemini ─► Grok ─► Mock                Python Validators + Auto-Fix        Per-User JSON / PDF / JPG / PNG
```

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide React, jsPDF
- **Backend:** Python 3.11+, Flask 3.1, Flask-Session, Pydantic
- **AI & Testing:** Google Gemini API, xAI Grok API, Mock Provider, Pytest, Vitest

---

## Quick Start

### Prerequisites
- **Node.js** `>= 20` and **Python** `>= 3.11`

### 1. Clone & Start the Backend
```bash
git clone https://github.com/akashmuddapu/ai-campaign-generator.git
cd ai-campaign-generator/backend

python -m venv .venv
# Windows: .venv\Scripts\activate | macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

python wsgi.py
```
> *Note: API keys (`GEMINI_API_KEY`, `GROK_API_KEY`) in `backend/.env` are optional—Mock mode runs out of the box.*

### 2. Start the Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Visit **`http://localhost:5173`** in your browser.

---

## Core API Endpoints (`/api`)

| Category | Method & Endpoint | Description |
| --- | --- | --- |
| **Auth** | `POST /auth/signup`, `/auth/login`, `/auth/logout` | User registration, client-salted SHA-256 verification & session management |
| **Studio Flow** | `POST /campaigns/suggest-personas`, `/persona-dna`, `/concepts`, `/generate-assets` | Steps 1–4 generation & automatic Brand Guardian Auto-Fix |
| **Drafts & History** | `POST /campaigns/draft` • `GET /campaigns` | Save/resume drafts at any step and manage user history |
| **Report Card** | `GET /campaigns/<id>/report-card` • `POST /campaigns/report-card/evaluate` | Brand Kit alignment scoring and improvement suggestions |
| **Step 6 Ad Studio** | `POST /campaigns/generate-ad-hooks`, `/campaigns/generate-ad-image` | Generate brand-safe ad hooks and **JPG / PNG** ad visuals |
| **Export & Presets** | `GET /campaigns/export/<id>` • `GET /presets` | Export Markdown/JSON bundles and load synthetic sample brands |

---

## Testing

```bash
# Backend tests
pytest backend/tests -q

# Frontend tests
npm --prefix frontend test -- --run
```

---

<p align="center">Built with ❤️ using React, Flask, and Google Gemini AI.</p>
