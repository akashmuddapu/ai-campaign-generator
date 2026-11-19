<!--
Sync Impact Report:
- Version change: 0.0.0 (Unratified Template) → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Specification-Driven Development
  - [PRINCIPLE_2_NAME] → II. Test-Driven Development (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. Modular Architecture
  - [PRINCIPLE_4_NAME] → IV. AI Provider Abstraction
  - [PRINCIPLE_5_NAME] → V. Security & Secrets Management
- Added sections:
  - Core Principle VI: Brand Safety & Deterministic Validation
  - Core Principle VII: Genuine Persona Personalization
  - Core Principle VIII: User Experience & Transparent States
  - Core Principle IX: Standardized REST API Design
  - Core Principle X: Maintainability & Code Clarity
  - Core Principle XI: Git Workflow & Collaboration
  - Core Principle XII: MVP First & End-to-End User Journey
  - Core Principle XIII: Hackathon Quality & Demo Readiness
  - Additional Technical Constraints & Standards
  - Development Workflow & Quality Gates
- Removed sections:
  - None (expanded template tokens into comprehensive ratified constitution)
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gates aligned)
  - ✅ .specify/templates/tasks-template.md (Enforced mandatory TDD task groups)
  - ✅ README.md (Aligned AI provider support: Gemini API & Grok API)
  - ✅ backend/.env.example (Updated environment variables for AI provider keys)
- Follow-up TODOs:
  - None; all tokens resolved and concrete values derived.
-->

# CampaignGuard AI Constitution

## Core Principles

### I. Specification-Driven Development
Requirements MUST be clearly specified in an approved feature specification (`spec.md`) before any implementation begins.
Implementation MUST strictly follow the approved specification, implementation plan (`plan.md`), and task breakdown (`tasks.md`).
Developers MUST NOT introduce features, endpoints, or user flows that fall outside the approved scope without formal specification amendments.
*Rationale*: Eliminates scope creep, aligns technical execution with business intent, and ensures all code serves verified requirements.

### II. Test-Driven Development (NON-NEGOTIABLE)
Every core functional requirement MUST have automated tests written before or in direct tandem with implementation.
Authentication, campaign generation, persona personalization, brand safety validation, auto-fix/repair routines, and content export MUST be thoroughly testable.
All test suites (unit, integration, contract) MUST pass completely before any feature or pull request is considered complete.
*Rationale*: Prevents regressions, guarantees predictable behavior, and ensures absolute reliability during live demonstrations.

### III. Modular Architecture
The React frontend and Flask backend MUST maintain strict physical and logical separation.
Backend business logic MUST be modularized into distinct, single-responsibility layers: routes (controllers), services (orchestration & business rules), validators (rule enforcement), and models (data structures & persistence).
AI provider integrations MUST be fully isolated behind an AI service layer, decoupling domain logic from vendor implementations.
*Rationale*: Ensures high cohesion, low coupling, seamless testability, and a clean codebase accessible to fresh developers.

### IV. AI Provider Abstraction
The system MUST support both Google Gemini API and xAI Grok API through a unified, provider-agnostic service interface.
Application code MUST NOT directly couple to any single vendor's SDK or proprietary payload format.
AI provider selection MUST be swappable at runtime via configuration (`AI_PROVIDER=gemini` or `AI_PROVIDER=grok`) without application code modifications.
API keys and provider credentials MUST NEVER be hardcoded or committed to version control; they MUST be loaded via environment variables.
*Rationale*: Mitigates vendor lock-in, increases operational resilience against provider rate limits/outages, and safeguards sensitive credentials.

### V. Security & Secrets Management
User authentication MUST employ secure, server-side session management (Flask-Session); client-side session tampering MUST be prevented.
Passwords MUST NEVER be stored in plain text and MUST be salted and hashed using industry-standard cryptographic hashing (e.g., `generate_password_hash`).
All secrets, private keys, and API tokens MUST be stored exclusively in environment variables (`.env`), accompanied by a sanitized `.env.example`.
Users MUST remain authenticated across valid requests until an explicit logout or session expiration occurs.
*Rationale*: Safeguards user data, protects paid AI API credentials, and satisfies production web security baselines.

### VI. Brand Safety & Deterministic Validation
Brand compliance rules MUST be explicitly modeled and enforced as formal application rules.
Hard constraints (length limits, character counts, banned words, forbidden phrases, mandatory disclosures) MUST be evaluated deterministically in code.
AI judgment MAY be utilized for semantic brand-fit, tone-of-voice alignment, and thematic nuance.
Flagged or non-compliant marketing content MUST be automatically fixable or regeneratable to bring it into strict compliance.
*Rationale*: Deterministic checks guarantee instantaneous, zero-cost, 100% reliable rule enforcement, while semantic AI evaluation and automated repair empower creators with actionable remediation.

### VII. Genuine Persona Personalization
Campaign content generated for distinct target personas MUST feature genuinely distinct marketing angles, value propositions, and tone hooks.
Generation pipelines MUST NOT simply reword or cosmetically paraphrase the same base text across multiple personas.
*Rationale*: Provides authentic marketing value, drives measurable conversion across audience segments, and demonstrates real AI capability.

### VIII. User Experience & Transparent States
The user interface MUST strictly implement the approved CampaignGuard AI design system and user experience guidelines.
The campaign generation and validation workflow MUST be self-explanatory, frictionless, and intuitive for first-time users.
All asynchronous states—loading (with descriptive stage indicators), success, rule violation warnings, and auto-fix progress—MUST be visibly transparent.
*Rationale*: Establishes user trust, eliminates confusion during multi-second AI generation runs, and guarantees presentation polish.

### IX. Standardized REST API Design
The React frontend MUST communicate with the Flask backend exclusively through RESTful JSON APIs.
API responses MUST utilize a consistent, predictable JSON envelope format for both success and error responses.
API errors MUST be handled consistently, returning appropriate HTTP status codes (e.g., 400, 401, 403, 404, 500) and actionable error descriptions.
*Rationale*: Prevents integration friction between frontend and backend teams and simplifies error handling and tracing.

### X. Maintainability & Code Clarity
UI components and backend utilities MUST be modular, reusable, and focused on a single responsibility.
Functions and methods MUST remain concise, self-documenting, and avoid unnecessary duplication (DRY principle).
The codebase MUST be written clearly with readable patterns, enabling junior- and fresher-level developers to navigate and contribute effectively.
*Rationale*: Maximizes maintainability, reduces technical debt, and accelerates collaborative development velocity.

### XI. Git Workflow & Collaboration
All development work MUST be divided into discrete, independently testable feature branches (`feat/`, `fix/`, `spec/`).
Team members MUST work on separate branches and merge changes exclusively through peer-reviewed Pull Requests.
The `main` branch MUST remain stable, fully tested, and continuously deployable at all times.
*Rationale*: Prevents integration chaos, eliminates merge conflicts, and maintains a stable baseline for live demonstrations.

### XII. MVP First & End-to-End User Journey
Engineering effort MUST prioritize completing the uninterrupted, end-to-end user journey over non-essential edge features.
The Minimum Viable Product (MVP) MUST demonstrate the full lifecycle: Authentication → Brief Input & Persona Selection → AI Campaign Generation → Brand Rule Validation → Auto-Fix Remediation → Content Export.
*Rationale*: Delivers immediate demonstrable business value and ensures the foundational journey is solid before expanding scope.

### XIII. Hackathon Quality & Demo Readiness
The application MUST maintain demo readiness throughout all stages of development.
The live demonstration MUST distinctly showcase the problem statement, intelligent guardrails solution, competitive differentiation, and business value.
All feature implementations MUST directly address judging criteria, emphasizing innovation, technical execution, and user experience.
*Rationale*: Guarantees high-impact presentation, leaves no room for catastrophic demo failures, and optimizes for judging excellence.

## Additional Technical Constraints & Standards

### Technology Stack Constraints
- **Frontend**: React 18+ bootstrapped with Vite, Tailwind CSS for styling, React Router for navigation, and Axios for HTTP networking.
- **Backend**: Python 3.10+ with Flask, Flask-CORS for cross-origin security, and Flask-Session for server-side state.
- **AI Integration**: AI Provider interface supporting Google Gemini API (`google-generativeai`) and xAI Grok API (`requests` / `openai` SDK abstraction).
- **Testing**: Pytest for backend unit/integration tests; Vitest and React Testing Library for frontend component tests.
- **Data Persistence**: JSON-based storage / SQLite suitable for zero-friction setup and portability during demos.

### AI Service Layer Contract
All AI provider implementations MUST implement the standard AI service interface:
1. `generate_campaign(brief: dict, persona: dict, rules: dict) -> dict`
2. `evaluate_brand_safety(content: str, rules: dict) -> dict`
3. `auto_fix_content(content: str, violations: list, rules: dict) -> dict`

## Development Workflow & Quality Gates

### Mandatory Quality Gates
1. **Gate 1: Specification Approval**: No code is written until `/specs/[###-feature]/spec.md` is complete and approved.
2. **Gate 2: Implementation Planning & Constitution Check**: `/specs/[###-feature]/plan.md` must pass all 13 constitutional principles before proceeding to tasks.
3. **Gate 3: Test-First Task Generation**: `/specs/[###-feature]/tasks.md` must define test tasks upfront that verify functional requirements before implementation tasks.
4. **Gate 4: Automated Verification**: Pull requests must have 100% passing tests and zero security violations (no hardcoded keys).
5. **Gate 5: Demo Verification**: New features must be verified end-to-end within the live browser UI to guarantee demo readiness.

## Governance

The CampaignGuard AI Constitution constitutes the authoritative engineering baseline for all contributors and automated agents.
- **Supremacy**: This constitution supersedes all undocumented practices or ad-hoc conventions.
- **Amendments**: Modifications require a documented justification, consensus among core contributors, and an update to this file including the Sync Impact Report.
- **Versioning Policy**:
  - **MAJOR (e.g., 2.0.0)**: Breaking architectural changes, removal or major redefinition of core principles.
  - **MINOR (e.g., 1.1.0)**: Addition of new principles, new quality gates, or new AI provider integrations.
  - **PATCH (e.g., 1.0.1)**: Clarifications, grammatical corrections, and non-substantive documentation improvements.
- **Compliance Enforcement**: All Pull Requests, design plans, and code reviews MUST explicitly verify adherence to these 13 principles before merging.

**Version**: 1.0.0 | **Ratified**: 2026-11-18 | **Last Amended**: 2026-11-18
