# Tasks: CampaignGuard AI MVP

**Input**: Design documents from `specs/001-campaign-generator-mvp/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`  
**Tests**: Tests are **MANDATORY** per Constitutional Principle II (Test-Driven Development). Tests must be written and failing before implementation for all functional requirements.  
**Organization**: Tasks are grouped by phase and user story to enable independent implementation and test verification of each story.

---

## Format: `[ID] [P?] [Story?] Description with file path`
- **[P]**: Can run in parallel (different files, no direct dependencies)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3], [US4], [US5])
- All task descriptions include concrete file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, environment setup, and base dependencies

- [x] T001 Configure backend environment and requirements in `backend/requirements.txt` and `backend/.env.example`
- [x] T002 [P] Configure frontend Tailwind CSS 4 theme and Vite plugins in `frontend/src/index.css` and `frontend/vite.config.js`
- [x] T003 [P] Initialize Flask application factory, CORS credentials, and session config in `backend/app/__init__.py` and `backend/app/config.py`
- [x] T004 [P] Setup Axios API client with base URL and cookie credential sharing in `frontend/src/services/api.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure, data persistence, AI abstraction, and base components that ALL user stories depend on.

*⚠️ CRITICAL: Must be completed before user story implementation begins.*

- [x] T005 [P] Implement thread-safe atomic JSON file persistence service in `backend/app/services/storage_service.py`
- [x] T006 [P] Implement core Pydantic models for User, BrandKit, and Customer Persona in `backend/app/models/user.py`, `backend/app/models/brand_kit.py`, and `backend/app/models/persona.py`
- [x] T007 [P] Implement core Pydantic models for CampaignConcept, CampaignAsset, BrandGuardianReport, and CampaignBundle in `backend/app/models/campaign.py`
- [x] T008 [P] Implement `BaseAIProvider` abstract interface and provider factory in `backend/app/services/ai_service.py`
- [x] T009 [P] Implement resilient offline mock provider with deterministic demo assets in `backend/app/services/mock_provider.py`
- [x] T010 [P] Implement Google Gemini API provider with error handling in `backend/app/services/gemini_provider.py`
- [x] T011 [P] Implement xAI Grok API provider with error handling in `backend/app/services/grok_provider.py`
- [x] T012 [P] Implement deterministic brand rules validator in `backend/app/validators/brand_rules.py` enforcing exact limits: Social Post <= 280 characters, Email Subject <= 60 characters, Email Body 75–250 words, and regex word-boundary banned-word detection
- [x] T013 [P] Create navigation bar with authentication status in `frontend/src/components/Navbar.jsx`
- [x] T014 [P] Create stage-aware asynchronous loading indicator in `frontend/src/components/LoadingIndicator.jsx`

**Checkpoint**: Foundation ready. AI providers, models, validators, and base layout are operational.

---

## Phase 3: User Story 1 - Complete End-to-End Campaign Generation Journey with Onboarding Presets (Priority: P1) 🎯 MVP

**Goal**: Marketers can load 1-click B2B Tech / B2C Consumer presets (or enter custom data), receive Persona DNA, select from 3 concepts, generate Social Post and Email assets, inspect Brand Guardian scores, trigger Auto-Fix on violations, review "Why This Content?", and export the campaign.

**Independent Test**: Execute full journey with sample inputs in `test_campaign_flow.py` and verify all 12 stages run successfully end-to-end.

### Tests for User Story 1 (MANDATORY - TDD) ⚠️
- [x] T015 [P] [US1] Contract and integration tests for demo presets and end-to-end campaign generation in `backend/tests/test_campaign_flow.py`
- [x] T016 [P] [US1] UI integration test for preset selection, campaign generation, and result views in `frontend/tests/CampaignFlow.test.jsx`

### Implementation for User Story 1
- [x] T017 [P] [US1] Create pre-seeded sample Brand Kits (B2B Tech "CyberShield" & B2C Consumer "ZenBrew") with contrasting personas in `backend/data/brand_kits.json`
- [x] T018 [P] [US1] Implement 1-click demo presets endpoint (`GET /api/presets`) in `backend/app/routes/preset_routes.py`
- [x] T019 [P] [US1] Build Preset Selector component for 1-click onboarding in `frontend/src/components/PresetSelector.jsx`
- [x] T020 [US1] Implement Brand Guardian composite scoring and diagnostic orchestration in `backend/app/services/brand_guardian.py`
- [x] T021 [US1] Implement campaign generation endpoints (`/api/campaigns/persona-dna`, `/api/campaigns/concepts`, `/api/campaigns/generate-assets`) in `backend/app/routes/campaign_routes.py`
- [x] T022 [P] [US1] Build Brand Kit and Persona input form page with 1-click Preset Selector in `frontend/src/pages/BrandPersonaSetupPage.jsx`
- [x] T023 [P] [US1] Build Persona DNA display and Concept Selection page in `frontend/src/pages/StrategyConceptPage.jsx`
- [x] T024 [P] [US1] Build Asset Card component for Social Post and Email in `frontend/src/components/AssetCard.jsx`
- [x] T025 [P] [US1] Build Brand Guardian badge & report card in `frontend/src/components/BrandGuardianBadge.jsx` and `frontend/src/components/ValidationReportCard.jsx`
- [x] T026 [US1] Build Campaign Results & Guardrails page integrating generation, evaluation, and auto-fix in `frontend/src/pages/CampaignResultsPage.jsx`

**Checkpoint**: User Story 1 is functional end-to-end. The core 30-point hackathon prototype with 1-click onboarding presets is live and demonstrable!

---

## Phase 4: User Story 2 - Multi-Persona Differentiation & Audience Strategy (Priority: P2)

**Goal**: Marketers can define contrasting customer personas for the same brand and receive genuinely distinct Persona DNA, angles, and copy rather than superficial rewrites.

**Independent Test**: Run generation for Persona A (Enterprise CISO) and Persona B (Startup CTO) against the same Brand Kit; verify >80% semantic variance in hooks and value propositions in `test_persona_differentiation.py`.

### Tests for User Story 2 (MANDATORY - TDD) ⚠️
- [x] T027 [P] [US2] Contract and unit tests for multi-persona angle divergence and anti-paraphrasing in `backend/tests/test_persona_differentiation.py`

### Implementation for User Story 2
- [x] T028 [US2] Enhance `generate_persona_dna` and `generate_campaign_concepts` in `backend/app/services/ai_service.py` to enforce distinct psychological drivers and value angles
- [x] T029 [P] [US2] Add persona switching and multi-persona tabs in `frontend/src/pages/BrandPersonaSetupPage.jsx`
- [x] T030 [P] [US2] Build Persona DNA comparison visualizer in `frontend/src/pages/StrategyConceptPage.jsx`

**Checkpoint**: Multi-persona tailoring is active and verifiable side-by-side, directly fulfilling the 20-point judging criteria!

---

## Phase 5: User Story 3 - Brand Guardian Validation Engine & Auto-Fix (Priority: P3)

**Goal**: Deterministic banned-word scanning and strict length checking combined with AI semantic evaluation, followed by one-click AI Auto-Fix using negative constraints to repair non-compliant copy while preserving the angle.

**Independent Test**: Intentionally inject banned words and length overruns; confirm deterministic detection flags violations with 100% reliability, docks score to <70, and Auto-Fix repairs copy back to passing (>=85%) in `test_validators.py` and `test_auto_fix.py`.

### Tests for User Story 3 (MANDATORY - TDD) ⚠️
- [x] T031 [P] [US3] Unit tests for deterministic banned-word scanning and strict length checking in `backend/tests/test_validators.py`
- [x] T032 [P] [US3] Unit and contract tests for AI-guided Auto-Fix loop and 2-attempt limit in `backend/tests/test_auto_fix.py`

### Implementation for User Story 3
- [x] T033 [US3] Implement `auto_fix_content` prompt logic with negative constraints in `backend/app/services/ai_service.py` and `backend/app/services/mock_provider.py`
- [x] T034 [US3] Add `/api/campaigns/auto-fix` endpoint enforcing a maximum of 2 subsequent remediation attempts, re-validating via Brand Guardian after each attempt and stopping immediately upon compliance in `backend/app/routes/campaign_routes.py`
- [x] T035 [P] [US3] Implement 1-click Auto-Fix action button and real-time score updates in `frontend/src/components/AssetCard.jsx` and `frontend/src/pages/CampaignResultsPage.jsx`

**Checkpoint**: Brand safety engine and automatic correction are operational, directly fulfilling the 20-point Brand Consistency criteria!

---

## Phase 6: User Story 4 - Secure User Authentication & Dashboard Management (Priority: P4)

**Goal**: Users can register, log in with securely hashed passwords, maintain active sessions across page reloads via Flask-Session, view recent campaigns on their dashboard, and safely log out.

**Independent Test**: Register a user, verify salted hash in `backend/data/users.json`, test session persistence across page reload, test invalid password rejection, and test route protection in `test_auth.py`.

### Tests for User Story 4 (MANDATORY - TDD) ⚠️
- [x] T036 [P] [US4] Contract and unit tests for signup, login, session cookies, and logout in `backend/tests/test_auth.py`
- [x] T037 [P] [US4] Component and route guard tests for authentication in `frontend/tests/Auth.test.jsx`

### Implementation for User Story 4
- [x] T038 [US4] Implement auth routes (`/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) in `backend/app/routes/auth_routes.py`
- [x] T039 [P] [US4] Build Landing Page with Hero section and CTA in `frontend/src/pages/LandingPage.jsx`
- [x] T040 [P] [US4] Build Sign In page in `frontend/src/pages/LoginPage.jsx`
- [x] T041 [P] [US4] Build Registration page in `frontend/src/pages/SignupPage.jsx`
- [x] T042 [US4] Build Dashboard page with saved campaigns list in `frontend/src/pages/DashboardPage.jsx`
- [x] T043 [US4] Configure React Router with protected route wrapper in `frontend/src/App.jsx`

**Checkpoint**: Authentication, session persistence, and personal dashboard are fully functional.

---

## Phase 7: User Story 5 - Campaign Explainability & Multi-Format Export (Priority: P5)

**Goal**: Marketers can inspect transparent business rationales behind generated copy ("Why This Content?") and export finalized campaigns in formatted Markdown (`.md`) and raw JSON (`.json`).

**Independent Test**: Trigger Markdown and JSON exports for a completed campaign; verify downloaded file structures, content integrity, and score inclusion in `test_export.py`.

### Tests for User Story 5 (MANDATORY - TDD) ⚠️
- [x] T044 [P] [US5] Unit tests for Markdown and JSON export format generation in `backend/tests/test_export.py`

### Implementation for User Story 5
- [x] T045 [US5] Implement Markdown and JSON export generation in `backend/app/services/export_service.py`
- [x] T046 [US5] Add `/api/campaigns/export/<id>` endpoint in `backend/app/routes/campaign_routes.py`
- [x] T047 [P] [US5] Build "Why This Content?" business explanation modal in `frontend/src/components/WhyThisContentModal.jsx`
- [x] T048 [P] [US5] Add one-click Markdown and JSON download triggers in `frontend/src/pages/CampaignResultsPage.jsx`

**Checkpoint**: Explainability and export completing the final workflow step are operational.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end demo verification, complete test runs, and final styling review for hackathon presentation excellence.

- [x] T049 Run full test suites (`pytest` and `npm test`) to verify 100% test pass rate across all modules
- [ ] T050 Execute end-to-end validation walkthrough per `specs/001-campaign-generator-mvp/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. **BLOCKS all user stories**.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. Delivers the core MVP prototype with 1-click onboarding presets.
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (extends Persona DNA & concepts).
- **User Story 3 (Phase 5)**: Depends on Phase 3 completion (extends validation & Auto-Fix).
- **User Story 4 (Phase 6)**: Can proceed in parallel with US2/US3 after Phase 2 (manages auth & session).
- **User Story 5 (Phase 7)**: Depends on Phase 3 completion (adds export & explainability).
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

---

## Parallel Execution Opportunities

### User Story 1 (P1)
```bash
# Launch test tasks in parallel:
Task: T015 [P] [US1] Contract and integration tests in backend/tests/test_campaign_flow.py
Task: T016 [P] [US1] UI integration test in frontend/tests/CampaignFlow.test.jsx

# Launch sample preset data and UI components in parallel:
Task: T017 [P] [US1] Create sample presets in backend/data/brand_kits.json
Task: T018 [P] [US1] Implement preset routes in backend/app/routes/preset_routes.py
Task: T019 [P] [US1] Build PresetSelector.jsx
Task: T022 [P] [US1] Build BrandPersonaSetupPage.jsx
Task: T023 [P] [US1] Build StrategyConceptPage.jsx
Task: T024 [P] [US1] Build AssetCard.jsx
Task: T025 [P] [US1] Build BrandGuardianBadge.jsx and ValidationReportCard.jsx
```

### Foundational Phase (Phase 2)
```bash
# Launch independent services in parallel:
Task: T005 [P] Implement storage_service.py
Task: T006 [P] Implement user.py, brand_kit.py, persona.py
Task: T007 [P] Implement campaign.py
Task: T008 [P] Implement ai_service.py
Task: T009 [P] Implement mock_provider.py
Task: T010 [P] Implement gemini_provider.py
Task: T011 [P] Implement grok_provider.py
Task: T012 [P] Implement brand_rules.py
Task: T013 [P] Create Navbar.jsx
Task: T014 [P] Create LoadingIndicator.jsx
```

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete **Phase 1: Setup** (dependencies, environment, basic configs).
2. Complete **Phase 2: Foundational** (data persistence, models, AI abstraction, deterministic validator).
3. Complete **Phase 3: User Story 1** (core campaign generation, 1-click B2B/B2C onboarding presets, and basic guardrails).
4. **STOP and VALIDATE**: Verify working prototype end-to-end with 1-click presets. (At this point, you have an operational 30-point working prototype).

### Incremental Delivery (Phases 4 through 8)
5. Add **User Story 2**: Persona tailoring and angle divergence (adds 20-point persona criteria).
6. Add **User Story 3**: Brand Guardian deterministic & semantic checks with 2-attempt Auto-Fix (adds 20-point brand consistency criteria).
7. Add **User Story 4**: Authentication, server-side session cookies, and dashboard management.
8. Add **User Story 5**: "Why This Content?" explainability and Markdown/JSON export.
9. Complete **Phase 8: Polish**: Final full test suite run and demo rehearsal (secures 15-point design & 15-point presentation criteria).
