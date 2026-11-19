\# 🛡️ CampaignGuard AI

**AI-Powered Marketing Campaign Generator with Brand Protection**

CampaignGuard AI helps businesses create personalized marketing campaigns while keeping every message consistent with their brand identity.

Simply enter your brand details, select your target customers, and let AI generate ready-to-use marketing content.

## 🚀 Key Features

- **Brand Kit:** Define your product, brand tone, tagline, and words to avoid.
- **Customer Personas:** Target different audiences such as students, professionals, and travellers.
- **AI Campaign Ideas:** Generate three creative campaign strategies.
- **Content Generation:** Create personalized social media posts and marketing emails for each persona.
- **Brand Guardian:** Checks generated content against brand guidelines.
- **Auto-Fix:** Detects and fixes content that violates brand rules.
- **Campaign Analytics:** Explore campaign activity and insights through a dashboard.
- **Campaign History:** View, edit, and continue previous campaigns.
- **Export:** Download campaigns in Markdown or JSON format.

## 🔄 How It Works

1. **Set Up Your Brand** – Enter product details, brand identity, and guidelines.
2. **Define Your Audience** – Select or create customer personas.
3. **Generate Campaign Ideas** – Get three AI-generated marketing strategies.
4. **Create Marketing Content** – Generate personalized social posts and emails.
5. **Check Brand Compliance** – Use Brand Guardian to validate and fix content.
6. **Export Your Campaign** – Download your final marketing materials.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Python, Flask |
| AI Integration | Google Gemini, Grok |
| Authentication | Flask Sessions |
| Testing | Vitest, Pytest |

## ⚙️ Getting Started

### Prerequisites

- Node.js 20 or later
- Python 3.11 or later
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/akashmuddapu/ai-campaign-generator.git
cd ai-campaign-generator
```

### 2. Start the Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key
```

Start the server:

```bash
python wsgi.py
```

Backend runs at `http://localhost:5000`.

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Open the frontend URL in your browser to use CampaignGuard AI.

**Note:** AI API keys are optional for Mock mode. External AI generation requires the respective provider's API key.

## 🧪 Running Tests

**Backend:**

```bash
cd backend
pytest -q
```

**Frontend:**

```bash
npm --prefix frontend test
```

## 🤖 AI Providers

- **Gemini:** AI-powered campaign generation using Google Gemini.
- **Grok:** Alternative AI-powered generation using xAI.
- **Mock:** Sample responses for testing and offline demonstrations.

## 🎯 Our Goal

To make professional marketing campaign creation simple, personalized, and brand-safe — without requiring users to write complex AI prompts.

---

