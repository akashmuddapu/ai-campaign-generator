# Implementation Plan: Campaign Report Card

**Branch**: `002-campaign-report-card` | **Date**: 2026-11-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [specs/002-campaign-report-card/spec.md](spec.md)

---

## Summary

The **Campaign Report Card** is an executive-level quality summary inserted into the CampaignGuard AI studio workflow between **Brand Guardian** (Step 4) and **Export Campaign** (Step 6). It provides marketing leaders and growth teams with a comprehensive 5-second evaluation of overall campaign health.

Key technical pillars of the implementation:
1. **Zero-Duplication Data Synthesis**: 100% reuse of pre-computed Brand Guardian evaluations (Brand Fit, Persona Fit, Channel Fit, Rule Compliance) without initiating redundant external LLM calls.
2. **Standardized Grading & Launch Readiness**: Deterministic letter grade assignment (`A+`, `A`, `B`, `C`, `D`) and 3-tier Launch Readiness badge (`Ready to Launch`, `Launch with Improvements`, `Needs Revision`).
3. **Interactive 5-Axis Radar Chart**: A lightweight, self-contained SVG polygon component (`CampaignRadarChart.jsx`) mapping Brand Consistency, Persona Relevance, Marketing Quality, Creativity, and Compliance without heavy third-party chart libraries.
4. **Persona Impact & Predictive Benchmarks**: Granular segment relevance and psychological triggers, coupled with heuristic channel conversion forecasts (LinkedIn Engagement, Email Open Rate, CTR).
5. **AI Insights & 1-Click Improvement**: Categorized Strengths, Opportunities, and Recommendations with an "Improve Campaign" slide-over drawer that generates targeted copy revisions and enables 1-click regeneration of weaker assets.
6. **Seamless Studio Integration**: Updating `SidebarLayout.jsx`, the top stepper tabs, and page routing to preserve end-to-end user state.

---

## Technical Context

**Language/Version**: Python 3.10+ (Backend, Python 3.14 installed in `backend/.venv`), JavaScript / Node.js 20+ (Frontend)

**Primary Dependencies**:
- **Backend**: Flask 3.1, Flask-CORS 6.0, Flask-Session 0.8, Pydantic 2.14, python-dotenv 1.2
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router DOM 7, Axios 1.21, Lucide React 1.75

**Storage**: Local atomic JSON files (`backend/data/campaigns.json`) with in-memory session persistence.

**Testing**:
- **Backend**: Pytest (`tests/test_report_card.py`) validating scoring heuristics, grade mapping, and API contracts.
- **Frontend**: Vitest + React Testing Library (`tests/CampaignReportCard.test.jsx`) validating radar chart rendering, score cards, and stepper navigation.

**Target Platform**: Web application running locally on modern browsers (Vite port 5173, Flask port 5000).

**Project Type**: Full-stack Web Application (React SPA + Flask REST API).

**Performance Goals**:
- <150ms latency for Report Card data load (due to zero-duplication reuse of Brand Guardian cache).
- <2.0s response time when executing "Improve Campaign" targeted asset regeneration.
- 0 bundle bloat (SVG radar chart implementation adds <3KB).

**Constraints**:
- Zero additional paid API quota consumed when loading or refreshing the report card.
- Must operate seamlessly in both live API mode (Gemini/Grok) and offline Mock Demo mode.
- Mobile responsive layout down to 375px viewport.

**Scale/Scope**: Campaign-level review supporting 1 to 5+ target personas and 2 core channels (Social Media Post & Marketing Email).

---

## Constitution Check

*GATE: All 13 constitutional principles verified and passing.*

- [x] **I. Specification-Driven**: Requirements are documented and scope is bounded in [specs/002-campaign-report-card/spec.md](spec.md).
- [x] **II. Test-Driven Development**: Automated test suites specified for score synthesis, grade mapping, radar chart rendering, and improvement flows.
- [x] **III. Modular Architecture**: Clear separation preserved: `report_card_service.py` (business logic) → `report_card_routes.py` (API endpoints) → `CampaignReportCardPage.jsx` & `CampaignRadarChart.jsx` (UI).
- [x] **IV. AI Provider Abstraction**: "Improve Campaign" regeneration operates strictly through `BaseAIProvider` (Gemini, Grok, or Mock fallback).
- [x] **V. Security & Sessions**: Flask-Session authorization enforced across all report card API endpoints.
- [x] **VI. Brand Safety**: Deterministic compliance calculations dock scores for unaddressed banned words and length breaches.
- [x] **VII. Persona Personalization**: Persona Impact Analysis explicitly evaluates differentiated value propositions per persona.
- [x] **VIII. UX & States**: Approved CampaignGuard purple theme (`#6B21A8` / `#7C3AED`), rounded cards, transparent loading states, and 1-click improvement drawer.
- [x] **IX. REST API Design**: Predictable JSON response envelopes adhering to [contracts/report-card-contract.md](contracts/report-card-contract.md).
- [x] **X. Maintainability**: DRY, single-responsibility components and mathematical scoring functions accessible to junior developers.
- [x] **XI. Git Workflow**: Scoped to feature branch `002-campaign-report-card`.
- [x] **XII. MVP First**: Prioritizes core 5-second executive assessment and actionable copy improvement.
- [x] **XIII. Hackathon Quality**: Polished executive radar visualization and benchmark forecasting demo-ready for presentation.

---

## Project Structure

### Documentation (this feature)
```text
specs/002-campaign-report-card/
├── spec.md                  # Feature requirements & acceptance criteria
├── plan.md                  # This implementation plan
├── research.md              # Architectural decisions & scoring heuristics
├── data-model.md            # Schemas, entity relationships & state machine
├── quickstart.md            # Validation walkthrough & test scenarios
├── checklists/
│   └── requirements.md      # Spec quality checklist (16/16 passing)
└── contracts/
    └── report-card-contract.md # REST API contract specifications
```

### Source Code Planned
```text
backend/
├── app/
│   ├── routes/
│   │   └── report_card_routes.py  # GET /report-card, POST /improve, POST /apply-improvements
│   └── services/
│       ├── report_card_service.py # Scoring synthesis, grade derivation, insights generator
│       └── performance_forecast_service.py # Channel response benchmark heuristics
└── tests/
    └── test_report_card.py        # Pytest unit & contract tests

frontend/
├── src/
│   ├── pages/
│   │   └── CampaignReportCardPage.jsx  # Main executive dashboard view (Step 5)
│   ├── components/
│   │   ├── CampaignRadarChart.jsx      # Responsive 5-axis SVG radar chart
│   │   ├── PersonaImpactCard.jsx       # Individual persona relevance & hook display
│   │   ├── PredictedPerformanceCard.jsx # Channel benchmark indicators
│   │   └── ImprovementDrawerModal.jsx  # Slide-over remediation & regeneration drawer
│   └── components/
│       └── SidebarLayout.jsx           # Insert "Campaign Report Card" navigation item
└── tests/
    └── CampaignReportCard.test.jsx     # Vitest & RTL component tests
```

---

## Implementation Phases

### Phase 1: Backend Foundation & Services
- Implement `report_card_service.py` to synthesize the 5 category scores from Brand Guardian data, assign letter grades, and generate AI insights.
- Implement `performance_forecast_service.py` to calculate predicted LinkedIn engagement, email open rates, and CTR.
- Implement `report_card_routes.py` with endpoints for retrieving report cards, generating improvement recommendations, and applying asset regeneration.
- Register blueprint in `app/__init__.py`.
- Write and pass backend test suite `tests/test_report_card.py`.

### Phase 2: Frontend UI Components
- Build `CampaignRadarChart.jsx` with SVG coordinate mapping, interactive hover tooltips, and responsive viewBox.
- Build `PersonaImpactCard.jsx` and `PredictedPerformanceCard.jsx`.
- Build `ImprovementDrawerModal.jsx` for reviewable, 1-click copy remediation.
- Assemble the complete `CampaignReportCardPage.jsx` following Brand Guardian design tokens (purple header, metric cards, readiness badge).

### Phase 3: Studio Workflow & Stepper Integration
- Update `App.jsx` to declare the `/report-card` route.
- Update `SidebarLayout.jsx` to insert "Campaign Report Card" with the Award icon between Brand Guardian and Export.
- Update `CampaignResultsPage.jsx` stepper header so the primary forward button on Brand Guardian directs to "Proceed to Report Card", and Report Card directs to "Proceed to Export".
- Update Campaign History report views to render the executive report card.
- Run frontend test suite `CampaignReportCard.test.jsx`.
