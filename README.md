# CampaignGuard AI 🛡️

> **AI-powered marketing campaign generator with built-in brand compliance.**
> Generate persona-targeted social posts and emails — validated against your brand rules in real time.




\


---

## 🎯 What Is This?

**CampaignGuard AI** is a full-stack AI-powered marketing platform that helps marketers create personalized, brand-compliant marketing campaigns.

The platform allows marketers to:

1. **Define a Brand Kit** — product name, description, tone tags, tagline, and banned words.
2. **Configure Customer Personas** — Student, Working Professional, Traveller, or custom personas.
3. **Generate Campaign Concepts** — AI generates three strategic campaign angles with hooks and key messages.
4. **Generate Personalized Assets** — unique social media posts (≤280 characters) and emails (75–250 words) for each persona.
5. **Run Brand Guardian** — validates assets against brand rules, including banned words, content length, and tone.
6. **Auto-Fix Violations** — automatically fixes brand compliance violations.
7. **Analyze Campaign Performance** — view campaign analytics and insights through the Analytics page.
8. **Export Campaigns** — download complete campaigns as Markdown or JSON.

All through a guided campaign studio with no AI prompt engineering required.

---

## 📸 App Screenshots

| Feature              | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| Brand Kit & Personas | Define products, brand tone, banned words, and customer personas.     |
| Campaign Assets      | Generate persona-specific social media posts and emails.              |
| Brand Guardian       | Review asset-wise compliance scores and automatically fix violations. |
| Analytics Dashboard  | Explore campaign analytics, performance metrics, and insights.        |
| Export               | Download complete campaigns in Markdown or JSON.                      |

---

## ✨ Key Features

| Feature                        | Description                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| 🧠 **AI Provider Abstraction** | Pluggable Gemini / Grok / Mock providers that can be switched without changing business logic. |
| 🛡️ **Brand Guardian**         | Deterministic banned-word detection, content-length validation, and semantic scoring.          |
| ⚡ **Auto-Fix Engine**          | Automatically replaces banned words and fixes over-length content.                             |
| 👤 **Persona DNA**             | Generates distinct marketing content for each customer persona.                                |
| 📊 **Analytics Dashboard**     | Provides campaign analytics, performance metrics, and visual insights.                         |
| 📥 **Offline Export**          | Client-side Markdown and JSON downloads.                                                       |
| 🕒 **Campaign History**        | Access previous campaigns, executive reports, and quick-edit functionality.                    |
| 🔐 **Authentication System**   | Server-side Flask sessions with password hashing.                                              |
| 📊 **Live Validation**         | Brand compliance scores update as campaign assets are edited.                                  |
| 🎨 **Sample Presets**          | TravelMate, CyberShield, and ZenBrew sample brand kits.                                        |

---

## 🏗️ Project Structure

```text
ai-campaign-generator/
├── frontend/                         # React 19 + Vite + Tailwind CSS 4
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BrandPersonaSetupPage.jsx
│   │   │   ├── StrategyConceptPage.jsx
│   │   │   ├── CampaignResultsPage.jsx
│   │   │   ├── CampaignHistoryReportPage.jsx
│   │   │   └── AnalyticsPage.jsx       # Campaign analytics dashboard
│   │   ├── components/
│   │   │   ├── SidebarLayout.jsx
│   │   │   ├── AssetCard.jsx
│   │   │   ├── BrandGuardianBadge.jsx
│   │   │   ├── WhyThisContentModal.jsx
│   │   │   ├── PresetSelector.jsx
│   │   │   └── ValidationReportCard.jsx
│   │   └── services/
│   │       └── api.js
│   └── tests/                          # Vitest + React Testing Library
│
├── backend/                            # Python Flask REST API
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── campaign_routes.py
│   │   │   └── preset_routes.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── gemini_provider.py
│   │   │   ├── grok_provider.py
│   │   │   ├── mock_provider.py
│   │   │   ├── brand_guardian.py
│   │   │   ├── export_service.py
│   │   │   └── storage_service.py
│   │   ├── models/
│   │   └── validators/
│   ├── data/
│   ├── tests/
│   ├── requirements.txt
│   └── wsgi.py
│
└── specs/
    └── 001-campaign-generator-mvp/
        ├── spec.md
        ├── plan.md
        ├── tasks.md
        └── contracts/
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

**Windows:**

```powershell
.venv\Scripts\activate
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

```env
SECRET_KEY=your-super-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key
```

API keys are optional. The application supports Mock mode when external AI providers are unavailable.

### 4. Start the Backend

From the `backend` directory:

```bash
python wsgi.py
```

Backend runs at:

```text
http://localhost:5000
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🤖 AI Provider Configuration

CampaignGuard AI uses an AI Provider Abstraction Layer.

Supported providers:

```text
Gemini → Grok → Mock
```

- **Gemini:** Google Gemini API integration.
- **Grok:** xAI Grok API integration.
- **Mock:** Deterministic fallback responses for offline demonstrations.

### Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com).
2. Create a project and generate an API key.
3. Add the key to `backend/.env`:

```env
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🧪 Running Tests

### Backend Tests

From the `backend` directory:

```bash
pytest -q
```

### Frontend Tests

From the project root:

```bash
npm --prefix frontend test
```

---

## 🌐 API Reference

All API endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint       | Description                        |
| ------ | -------------- | ---------------------------------- |
| POST   | `/auth/signup` | Register a new user                |
| POST   | `/auth/login`  | Authenticate a user                |
| POST   | `/auth/logout` | End the current session            |
| GET    | `/auth/me`     | Get the current authenticated user |

### Campaigns

| Method | Endpoint                     | Description                             |
| ------ | ---------------------------- | --------------------------------------- |
| POST   | `/campaigns/persona-dna`     | Generate persona psychological profiles |
| POST   | `/campaigns/concepts`        | Generate three campaign concepts        |
| POST   | `/campaigns/generate-assets` | Generate social posts and emails        |
| POST   | `/campaigns/auto-fix`        | Fix brand compliance violations         |
| POST   | `/campaigns/validate`        | Validate campaign assets                |
| GET    | `/campaigns`                 | Retrieve campaign history               |
| GET    | `/campaigns/<id>`            | Retrieve a campaign                     |
| PUT    | `/campaigns/<id>`            | Update campaign data                    |
| DELETE | `/campaigns/<id>`            | Delete a campaign                       |
| GET    | `/campaigns/export/<id>`     | Export a campaign                       |

### Presets

| Method | Endpoint        | Description                      |
| ------ | --------------- | -------------------------------- |
| GET    | `/presets`      | List available sample brand kits |
| GET    | `/presets/<id>` | Retrieve a specific preset       |

---

## 🎨 Tech Stack

| Layer              | Technology                     |
| ------------------ | ------------------------------ |
| Frontend Framework | React 19                       |
| Build Tool         | Vite 8                         |
| Styling            | Tailwind CSS 4                 |
| Routing            | React Router 7                 |
| HTTP Client        | Axios                          |
| Icons              | Lucide React                   |
| Frontend Testing   | Vitest + React Testing Library |
| Backend Framework  | Flask 3.1                      |
| Session Management | Flask-Session                  |
| CORS               | Flask-CORS                     |
| AI Integration     | OpenAI-compatible SDK          |
| Data Validation    | Pydantic                       |
| Backend Testing    | Pytest                         |

---

## 🔐 Environment Variables

### `backend/.env`

| Variable         | Required | Description                                  |
| ---------------- | -------- | -------------------------------------------- |
| `SECRET_KEY`     | Yes      | Flask session secret                         |
| `GEMINI_API_KEY` | No       | Google Gemini API key                        |
| `GROK_API_KEY`   | No       | xAI Grok API key                             |
| `SESSION_TYPE`   | No       | Session storage type; defaults to filesystem |

---

## 📋 5-Step Campaign Studio Workflow

```text
Step 1 → Brand Kit & Personas
         Define product details, brand tone, tagline,
         banned words, and customer personas.

Step 2 → Persona DNA
         Generate psychological profiles including goals,
         pain points, motivations, and preferred tone.

Step 3 → Campaign Concepts
         Generate and select strategic campaign angles,
         headlines, hooks, and key messages.

Step 4 → Campaign Assets
         Generate persona-specific social media posts
         and emails. Edit, regenerate, or auto-fix assets.

Step 5 → Brand Guardian & Export
         Validate content, review compliance scores,
         automatically fix violations, and export campaigns.
```

The Analytics page provides an additional view of campaign data and insights.

---

## 🗂️ Campaign History

CampaignGuard AI maintains previous campaigns in the sidebar.

Users can access:

- **Executive Reports** — campaign details, brand kit, strategy, personas, and generated assets.
- **Quick Edit Mode** — modify product information, taglines, social posts, and emails.
- **Resume in Studio** — continue working on previously generated campaigns.
- **Export** — download campaign data in Markdown or JSON.

---

## 📊 Analytics Dashboard

The Analytics page provides a centralized view of campaign-related insights.

It is designed to help users understand campaign activity, review performance metrics, and analyze campaign data through visual representations.

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name

git add .
git commit -m "feat: add your feature"

git push origin feature/your-feature-name
```

Open a Pull Request to merge your changes.

Please follow the engineering principles documented in `.specify/memory/constitution.md`.

---

\<p align="center">   Built with ❤️ using React, Flask, and Google Gemini AI. \</p>
