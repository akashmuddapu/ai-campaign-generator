# Quickstart & Validation Guide: Campaign Report Card

**Feature**: `002-campaign-report-card`  
**Date**: 2026-11-19  
**Status**: Ready for Validation  

This guide provides end-to-end validation scenarios for the Campaign Report Card feature in CampaignGuard AI.

---

## Prerequisites

1. **Backend Running**: Port 5000 (`http://localhost:5000`)
2. **Frontend Running**: Port 5173 (`http://localhost:5173`)
3. **Session Authenticated**: Logged into a test account (e.g. `demo@campaignguard.ai` or sample user)

---

## 1. Automated Verification Commands

### Backend Contract & Unit Tests
Run backend tests validating Report Card score synthesis, grade mapping, and API endpoints:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest tests/test_report_card.py -v
```

### Frontend Component & Route Tests
Run frontend test suites verifying the Report Card view, Radar Chart rendering, and stepper flow:
```powershell
cd frontend
npm test -- tests/CampaignReportCard.test.jsx
```

---

## 2. Manual End-to-End Walkthrough Scenarios

### Scenario 1: Executive Review & Grade Verification
1. Navigate to `http://localhost:5173/dashboard` and open the **"TravelMate Smart Mug"** sample campaign (or generate a new campaign).
2. Click through: **Brand & Personas** → **Campaign Concepts** → **Campaign Assets** → **Brand Guardian**.
3. Verify that the primary button on Brand Guardian is now **"Proceed to Report Card"**.
4. Click **"Proceed to Report Card"** and verify that the URL updates to `/report-card` (or `/results/report-card`).
5. **Verify UI Elements**:
   - Overall Score displays (e.g., `96 / 100`)
   - Grade badge displays (`A+` in emerald green)
   - Launch Readiness status shows `Ready to Launch`
   - 5-axis Radar Chart renders Brand Consistency, Persona Relevance, Marketing Quality, Creativity, and Compliance.
   - Persona Impact Analysis lists each persona (e.g. "Student" and "Working Professional") with their respective relevance score and psychological trigger.
   - Predicted Performance cards show LinkedIn Engagement, Email Open Rate, and CTR against industry benchmarks.

---

### Scenario 2: Actionable "Improve Campaign" Flow
1. Load a campaign with an intentionally flagged banned word (e.g. overall score < 75).
2. Navigate to the **Campaign Report Card**.
3. Verify that the Launch Readiness status shows `Needs Revision` (or `Launch with Improvements`) and grade shows `C` or `D`.
4. Click the **"Improve Campaign"** button.
5. In the slide-over drawer, verify that targeted improvement recommendations are listed for the underperforming assets.
6. Click **"Apply Improvements & Regenerate"**.
7. Verify that the copy is repaired, the drawer closes, and the Report Card immediately re-scores to a passing grade (`A` or `A+`).

---

### Scenario 3: Stepper & Export Handoff
1. On the Report Card page, click the **"Proceed to Export"** primary button.
2. Verify smooth navigation to the Export Campaign view.
3. Download the Markdown or JSON export.
4. Verify that the exported file contains the **Executive Campaign Report Card** summary (Grade, Score, Readiness, and Category Metrics) at the top of the dossier.
