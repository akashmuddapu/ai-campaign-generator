# Quickstart & Validation Guide: CampaignGuard AI MVP

**Feature**: `001-campaign-generator-mvp`  
**Date**: 2026-11-18  
**Status**: Ready for Execution  

This guide provides step-by-step instructions for running the CampaignGuard AI full-stack application and validating the complete 12-step user journey.

---

## Prerequisites

- **Python**: 3.10+ (Python 3.13 installed in `backend/.venv`)
- **Node.js**: v20+ with npm
- **Environment**: Modern web browser (Chrome / Edge / Firefox)

---

## 1. Environment Setup

### Backend (.env)
In `backend/`, copy `.env.example` to `.env`:
```bash
# In backend/ directory:
cp .env.example .env
```
Ensure `.env` contains:
```env
FLASK_SECRET_KEY=dev-secret-key-campaignguard-2026
AI_PROVIDER=gemini # or grok, or mock for offline demo
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key
```
*(Note: If no API key is provided, the application automatically runs in resilient **Mock Demo Mode**, returning realistic pre-calculated assets and validation scores without failing).*

---

## 2. Starting the Application

### Start Backend API Server
```powershell
# From repository root:
cd backend
.\.venv\Scripts\Activate.ps1
python -m flask --app app run --port 5000
```
Backend will be live at: `http://localhost:5000` (API status check: `GET http://localhost:5000/api/auth/me`).

### Start Frontend Application
```powershell
# From repository root (in a new terminal):
cd frontend
npm run dev
```
Frontend will be live at: `http://localhost:5173`.

---

## 3. End-to-End Validation Walkthrough (Hackathon Demo Journey)

### Step 1: Landing Page & Auth
1. Open `http://localhost:5173` in your browser. Verify the CampaignGuard AI shield branding, purple gradient styling, and value proposition.
2. Click **"Get Started"** or **"Sign Up"**.
3. Register a test account: `demo@campaignguard.ai` / `DemoPass123!`.
4. Verify immediate redirect to the **Dashboard** and active session persistence.

### Step 2: 1-Click Demo Preset Loading
1. From the Dashboard, click **"New Campaign"**.
2. Click **"Load Sample Campaign"** at the top right.
3. Select the **"CyberShield (B2B SaaS)"** preset.
4. Verify that:
   - Brand Kit fields populate: Product Name, Description, Tone ("Authoritative"), Tagline, and Banned Words (e.g. `"cheap, hack, guarantee"`).
   - Two contrasting personas appear: **"Enterprise CISO"** and **"Fast-Paced Startup CTO"**.
5. Select **"Enterprise CISO"** and click **"Generate Strategy"**.

### Step 3: Persona DNA & Concept Selection
1. Verify the generated **Persona DNA / Audience Strategy** highlights the core psychological driver (risk mitigation, vendor reputation) and recommended hooks.
2. Click **"Generate Campaign Concepts"**.
3. Verify that 3 distinct concepts render with creative themes and target persona rationales.
4. Select Concept 1 (e.g., *"Zero Trust Without Zero Velocity"*) and click **"Generate Assets"**.

### Step 4: Asset Review & Brand Guardian Validation
1. Verify the generated **Social Media Post** and **Marketing Email**.
2. Inspect the **Brand Guardian** score badge and dimension breakdown:
   - Brand Fit
   - Persona Fit
   - Channel Fit
   - Rule Compliance
   - Length Check (Social <= 280 chars, Email Subject <= 60 chars, Body 75-250 words)
   - Banned Words Check
3. Verify the **"Why This Content?"** tab explains the psychological and brand reasons behind the copy.

### Step 5: Auto-Fix Trigger & Remediation
1. In the Social Post editor, intentionally type a banned word (e.g., *"Our cheap security hack will guarantee success"*).
2. Observe Brand Guardian immediately flag the banned words and dock the score below 70 (Red Fail badge).
3. Click the **"Auto-Fix"** button.
4. Verify that the AI remediation engine eliminates the banned words and restores compliant length while preserving the CISO angle and concept hook.
5. Verify Brand Guardian re-scores the content to Pass (Green badge, >=85%).

### Step 6: Multi-Format Export
1. Click **"Export Campaign"**.
2. Select **"Export as Markdown"**: Verify download of `campaign.md` containing full brief, strategy, assets, and validation scores.
3. Select **"Export as JSON"**: Verify download of `campaign.json` containing complete structured payload.

---

## 4. Running Automated Tests

### Backend Test Suite (Pytest)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest tests/ -v
```
Expected: 100% test pass rate across auth, brand validation, AI service interface, auto-fix, and exports.

### Frontend Test Suite (Vitest)
```powershell
cd frontend
npm test
```
Expected: 100% test pass rate across UI flows and components.
