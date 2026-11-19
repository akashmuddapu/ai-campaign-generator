# Feature Specification: CampaignGuard AI MVP

**Feature Branch**: `001-campaign-generator-mvp`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Build the MVP specification for CampaignGuard AI, an AI-powered marketing campaign generator. The application should help marketers create brand-consistent marketing campaigns for different customer personas."

## Clarifications

### Session 2026-11-18
- Q: How should CampaignGuard AI handle demo data and onboarding for the hackathon prototype? → A: Include 1-click "Load Sample Campaign" presets (e.g., B2B Tech & B2C Consumer) with contrasting personas alongside custom input.
- Q: What exact length validation constraints should Brand Guardian deterministically enforce for the MVP channels? → A: Explicit standards: Social Post max 280 chars; Email Subject max 60 chars; Email Body 75-250 words.
- Q: How should the Auto-Fix engine remediate non-compliant content when triggered by the user? → A: AI-guided repair with negative constraints: Prompt the AI service to rewrite the copy, strictly forbidding flagged banned words and enforcing length limits while keeping the persona hook.
- Q: Should the AI service layer include a fallback mode to ensure uninterrupted live hackathon demos during network or API disruptions? → A: Include a mock/fallback mode in the AI service layer returning realistic pre-generated campaign assets if API keys are unset or network fails.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete End-to-End Campaign Generation Journey (Priority: P1) 🎯 MVP

A digital marketer arrives at the CampaignGuard AI web app landing page, logs in with their credentials, and navigates to the Campaign Generator. They fill in their Brand Kit (Product Name, Description, Brand Tone, Tagline, Banned Words, and Example Brand Lines) and select/create a target Customer Persona (Goals, Pain Points, Motivations, Emotional Triggers, Preferred Style, Buying Triggers). 

The system analyzes the persona and generates an actionable Persona DNA / Audience Strategy. Next, the system presents at least 3 distinct Campaign Concepts with unique angles. The marketer selects their preferred concept, and the system generates two core campaign assets: a Social Media Post and a Marketing Email. 

The marketer reviews the assets alongside the Brand Guardian validation panel (showing an overall 0-100 score, 6 diagnostic dimension checks, and deterministic flags). For any violations, the marketer clicks "Auto-Fix", which automatically corrects the copy to satisfy all brand rules while preserving the selected concept and persona angle. Finally, the marketer reviews the "Why This Content?" explanation and exports the finalized campaign to Markdown or JSON.

**Why this priority**: Delivers the complete end-to-end user journey across all 12 stages specified in the product vision. This directly satisfies the 30-point "Working Prototype" and 15-point "Presentation & Demo" hackathon judging criteria.

**Independent Test**: Can be verified by executing a single automated or manual test run that: (1) authenticates a user, (2) submits Brand Kit and Persona data, (3) verifies generated Persona DNA, (4) selects a concept from >=3 generated concepts, (5) generates social post & email, (6) confirms Brand Guardian scoring, (7) triggers Auto-Fix on an intentional violation, (8) verifies "Why This Content?", and (9) downloads Markdown and JSON exports.

**Acceptance Scenarios**:

1. **Given** a visitor on the Landing Page, **When** they click "Get Started" or "Sign In", **Then** they can authenticate and land on their active Dashboard.
2. **Given** an authenticated user on the Brand & Persona view, **When** they submit valid Brand Kit and Persona fields, **Then** the system outputs a Persona DNA / Audience Strategy summarizing emotional drivers, tone requirements, and recommended messaging angles.
3. **Given** an active Persona DNA, **When** campaign concepts are generated, **Then** the system displays at least 3 distinct conceptual directions, each with a Title, Strategic Theme, Creative Hook, and Target Persona Rationale.
4. **Given** a chosen Campaign Concept, **When** the user clicks "Generate Assets", **Then** the system produces:
   - A structured **Social Media Post** (Headline, Post Body, Relevant Hashtags, and Visual Concept Suggestion).
   - A structured **Marketing Email** (Subject Line, Preview Text, Body Copy, and Call-to-Action).
5. **Given** generated assets evaluated by Brand Guardian, **When** violations are identified (e.g. banned words, length limits), **Then** the UI displays an overall 0-100 score, highlights specific failing checks, and activates the "Auto-Fix" action.
6. **Given** non-compliant content, **When** the user clicks "Auto-Fix", **Then** the system deterministically resolves banned words and length overruns while maintaining the creative hook and persona messaging angle, returning a passing validation score.
7. **Given** validated assets, **When** the user opens "Why This Content?", **Then** the system provides clear, non-technical business explanations connecting the copy to the persona's psychological drivers and brand tone.
8. **Given** a finalized campaign, **When** the user clicks "Export", **Then** the system generates and downloads both Markdown (`.md`) and JSON (`.json`) files containing the entire campaign bundle.

---

### User Story 2 - Persona Tailoring & Audience Strategy Differentiation (Priority: P2)

A marketer needs to market the same product to contrasting audience segments (e.g., a technical enterprise buyer vs. a fast-moving startup founder). The user defines two distinct personas with different goals, pain points, emotional triggers, and buying triggers. The system generates distinct Persona DNA strategies and produces campaign concepts and assets that target genuinely different psychological angles rather than merely rewording the same message with swapped synonyms.

**Why this priority**: Directly satisfies the 20-point "Persona Tailoring" hackathon judging criteria. Generic AI generators fail by creating superficial paraphrases; CampaignGuard AI must prove verifiable angle divergence.

**Independent Test**: Run generation with identical Brand Kit against Persona A (Enterprise IT Director) and Persona B (Early-Stage Founder). Validate that Persona A's assets emphasize risk mitigation, compliance, ROI, and authoritative tone, while Persona B's assets emphasize agility, speed-to-market, and lean efficiency.

**Acceptance Scenarios**:

1. **Given** Persona A and Persona B with contrasting pain points and buying triggers, **When** the system generates Persona DNA, **Then** the recommended messaging hooks and psychological resonance factors are verifiably distinct between the two.
2. **Given** two distinct personas for the same product, **When** campaign assets are generated, **Then** the core value propositions and hooks diverge completely (semantic variance >80%), avoiding cosmetic paraphrasing.
3. **Given** the generated copy, **When** inspected in "Why This Content?", **Then** the explanation explicitly articulates how the messaging directly addresses that specific persona's buying triggers.

---

### User Story 3 - Brand Guardian Deterministic & Semantic Validation Engine (Priority: P3)

A brand compliance officer requires strict adherence to corporate tone, length limits, and banned terminology. When campaign assets are generated, Brand Guardian immediately executes deterministic checks in backend code (banned-word scanner and character/word length counters) along with semantic AI evaluations (Brand Fit, Persona Fit, Channel Fit, Rule Compliance). The system calculates an aggregate 0-100 score, shows diagnostic feedback, and offers both automated remediation ("Auto-Fix") and fresh regeneration.

**Why this priority**: Directly satisfies the 20-point "Brand Consistency & Checks" hackathon judging criteria. It combines zero-cost, 100% reliable deterministic rules with intelligent semantic guardrails.

**Independent Test**: Injected banned words (e.g., "cheap", "guarantee", "hack") or intentional length overruns must be flagged 100% of the time by backend validators without false negatives, lowering the compliance score and pinpointing exact offending terms.

**Acceptance Scenarios**:

1. **Given** a Brand Kit containing banned words, **When** any generated asset contains an exact or case-insensitive match for a banned word, **Then** the deterministic validator immediately marks Banned Words as Failed, highlights the exact words, and docks the score.
2. **Given** channel length constraints (e.g., social post max 280 characters, email subject line max 60 characters), **When** generated content exceeds the threshold, **Then** the deterministic validator flags Length Check as Failed and displays the exact character overrun.
3. **Given** semantic criteria (Brand Tone, Persona Resonance, Channel Best Practices), **When** evaluated, **Then** Brand Guardian assigns diagnostic sub-scores and descriptive feedback for Brand Fit, Persona Fit, and Channel Fit.
4. **Given** a failing asset, **When** the user clicks "Regenerate", **Then** the system requests a fresh asset from the AI provider enforcing strict negative constraints against previous violations.

---

### User Story 4 - Secure Session Authentication & Dashboard Management (Priority: P4)

A user registers with an email and password, logs into CampaignGuard AI, and lands on a personalized Dashboard. The user's password is cryptographically salted and hashed on the server, user records are stored in a local JSON file (`data/users.json`), and the session persists across page refreshes and route transitions via Flask server-side session cookies until explicit logout or session expiry.

**Why this priority**: Essential for application security, data isolation, and professional user experience. Demonstrates clean architectural hygiene and satisfies Constitutional Principle V.

**Independent Test**: Test account registration, verify that passwords in `data/users.json` are hashed, test login with correct and incorrect passwords, verify session persistence across page reload, and confirm logout invalidates the session cookie.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they submit the registration form, **Then** the backend securely hashes their password, stores the user in `data/users.json`, initializes a server-side session, and redirects to the Dashboard.
2. **Given** an authenticated user, **When** they refresh the browser or navigate between views, **Then** their authenticated state and session data persist seamlessly.
3. **Given** an authenticated user, **When** they click "Log Out", **Then** the server invalidates their session, clears the session cookie, and redirects them to the Landing Page.
4. **Given** an unauthenticated visitor, **When** they attempt to access protected endpoints or views (`/dashboard`, `/generator`), **Then** they are redirected to the Login page.

---

### User Story 5 - Multi-Format Campaign Export & Transparent Business Explainability (Priority: P5)

A marketer prepares to present campaign results to stakeholders and export copy for execution. They inspect the "Why This Content?" panel for each asset, which breaks down the strategic rationale in accessible business terms. They then click "Export as Markdown" or "Export as JSON" to download the complete campaign package.

**Why this priority**: Completes the final step of the user journey, enabling real-world utility and workflow integration for marketing teams.

**Independent Test**: Generate a campaign, click export buttons, and verify that the downloaded Markdown file renders properly with all headings, copy, and validation tables, and that the JSON file contains valid, well-structured data.

**Acceptance Scenarios**:

1. **Given** completed campaign assets, **When** the user clicks "Why This Content?", **Then** the system displays a clear explanation answering:
   - Why this specific angle was chosen for this persona.
   - How the tone conforms to the Brand Kit.
   - Why this structure and CTA suit the channel.
2. **Given** an export request for Markdown, **When** triggered, **Then** the browser downloads a `.md` file containing campaign metadata, Brand Kit summary, Persona DNA, concepts, social post, email, validation scores, and explanations.
3. **Given** an export request for JSON, **When** triggered, **Then** the browser downloads a valid, schema-compliant `.json` file containing all campaign entities.

---

### Edge Cases

- **AI Provider Outage or Rate Limit**: If Gemini API or Grok API fails, times out, or API keys are missing, the backend MUST gracefully switch to the built-in fallback/mock service mode to return realistic demo assets with an unobtrusive "Demo Mode Active" notification, allowing judging demos to proceed without interruption.
- **AI Provider Hot-Swapping**: When the backend environment variable `AI_PROVIDER` is switched from `gemini` to `grok` (or vice-versa), all downstream generation and evaluation workflows MUST continue functioning without code modifications.
- **Zero-Banned-Words Brand Kit**: When a Brand Kit contains no banned words, the deterministic scanner MUST pass immediately with a 100% score for that dimension.
- **Repeated Auto-Fix Failures**: If an asset fails validation after an initial Auto-Fix attempt, the system MUST permit a second automated repair pass. If violations persist after 2 passes, the system MUST highlight the exact unresolved rule and offer an inline manual edit mode.
- **Malformed or Incomplete Input Data**: If required fields (Product Name, Brand Tone, Persona Name, Goals) are missing, the frontend and backend validators MUST reject submission with explicit, field-level validation messages before calling AI services.
- **Session Timeout During Content Generation**: If a user's session expires while waiting for AI generation, the frontend MUST preserve the generated response in memory and prompt the user to re-authenticate without losing their work.

---

## Requirements *(mandatory)*

### Functional Requirements

#### 1. Authentication & Session Management
- **FR-001**: System MUST provide user signup, login, and logout endpoints and UI views.
- **FR-002**: System MUST store user records in a local JSON file (`backend/data/users.json` or configured data directory) for the hackathon MVP.
- **FR-003**: System MUST hash all passwords with a cryptographic salt using `werkzeug.security` (`generate_password_hash` / `check_password_hash`) or equivalent secure standard; plain-text passwords MUST NEVER be stored or logged.
- **FR-004**: System MUST use Flask server-side session management (`Flask-Session`) with secure session cookies.
- **FR-005**: User sessions MUST persist across frontend route changes, browser refreshes, and navigation until explicit logout or configured session expiry.
- **FR-006**: System MUST protect all authenticated routes and APIs; unauthenticated requests MUST receive a `401 Unauthorized` status and redirect to `/login`.

#### 2. Brand Kit & Persona Configuration
- **FR-007**: System MUST allow users to input and persist Brand Kit data containing:
  - Product Name (string, required)
  - Product Description (string, required)
  - Brand Tone (string/select, e.g., Authoritative, Bold, Friendly, Witty, Elegant, required)
  - Tagline (string, optional)
  - Banned Words (list of strings / comma-separated, optional)
  - Example Brand Lines (list of strings / multiline, optional)
- **FR-008**: System MUST allow users to input and persist Customer Persona data containing:
  - Persona Name (string, required)
  - Primary Goals (list/string, required)
  - Pain Points (list/string, required)
  - Core Motivations (list/string, required)
  - Emotional Triggers (list/string, required)
  - Preferred Message Style (string/select, required)
  - Buying Triggers (list/string, required)
- **FR-009**: System MUST allow managing and switching between multiple personas under the same account/brand.
- **FR-010**: System MUST provide 1-click "Load Sample Campaign" presets (including pre-configured B2B Tech and B2C Consumer brand kits with contrasting personas) to enable immediate testing and live hackathon demonstration without requiring manual data entry.

#### 3. Persona DNA & Audience Strategy Generation
- **FR-011**: System MUST generate a structured "Persona DNA / Audience Strategy" synthesizing the persona's psychological drivers into tactical communication guidance.
- **FR-012**: Persona DNA MUST include: Core Psychological Driver, Recommended Value Angle, Tone Vector, and High-Resonance Messaging Hooks.
- **FR-013**: System MUST enforce genuine differentiation between personas, verifying that campaigns for different personas address distinct value propositions and emotional hooks.

#### 4. Campaign Concept Generation & Selection
- **FR-014**: System MUST generate at least 3 distinct Campaign Concepts prior to asset generation.
- **FR-015**: Each Campaign Concept MUST include: Concept Title, Strategic Theme, Creative Hook, and Target Persona Rationale.
- **FR-016**: System MUST allow the user to select one preferred Campaign Concept to govern subsequent asset generation.

#### 5. Campaign Asset Generation
- **FR-017**: System MUST generate two core asset types based on the selected Campaign Concept:
  1. **Social Media Post**: Optimized for social engagement with Headline, Post Body, Recommended Hashtags, and Visual Image Suggestion.
  2. **Marketing Email**: Structured with Subject Line, Preview Text, Email Body Copy, and Call-to-Action (CTA).
- **FR-018**: System MUST display visual loading indicators with dynamic status messages (e.g., "Analyzing Persona DNA...", "Generating Campaign Concepts...", "Evaluating Brand Guardian...") during all AI operations.

#### 6. Brand Guardian Validation Engine
- **FR-019**: System MUST validate all generated assets across six dimensions:
  1. **Brand Fit**: Semantic alignment with the brand tone and core identity.
  2. **Persona Fit**: Relevance to persona pain points, goals, and emotional triggers.
  3. **Channel Fit**: Adherence to social and email best practices, formatting, and pacing.
  4. **Rule Compliance**: Compliance with custom brand rules, taglines, and required disclosures.
  5. **Length Validation**: Deterministic character and word count checking against fixed channel standards (Social Media Post: maximum 280 characters; Email Subject Line: maximum 60 characters; Email Body: 75–250 words).
  6. **Banned-Word Detection**: Deterministic exact-match and word-boundary scanning against the Brand Kit banned-words list.
- **FR-020**: Length validation and banned-word detection MUST be implemented as deterministic logic in backend code (Python) and MUST NOT rely exclusively on probabilistic LLM responses.
- **FR-021**: System MUST calculate an overall Brand Safety Score (0-100) and assign status badges (Pass [green], Warning [amber], Fail [red]) for each dimension.
- **FR-022**: System MUST provide transparent, line-by-line diagnostic feedback detailing the exact reason for any warning or failure.

#### 7. Auto-Fix & Content Regeneration
- **FR-023**: System MUST provide an "Auto-Fix" action for assets with validation violations.
- **FR-024**: When Auto-Fix is executed, the backend MUST invoke the AI provider's `auto_fix_content` routine with a dedicated repair prompt that supplies the original copy, specific detected violations, and strict negative constraints (forbidding detected banned words, enforcing channel length limits) to produce compliant copy while strictly preserving the selected persona, campaign concept, and core message angle.
- **FR-025**: Following Auto-Fix, the system MUST re-run Brand Guardian validation and display the updated score and status in real time.
- **FR-026**: System MUST provide a "Regenerate" action allowing users to generate a completely new candidate asset for the selected concept.

#### 8. "Why This Content?" Explainability
- **FR-027**: System MUST provide a plain-language business explanation ("Why This Content?") for every generated asset.
- **FR-028**: The explanation MUST detail:
  - **Persona Hook**: Why this angle specifically appeals to the persona's pain points and buying triggers.
  - **Brand Alignment**: How the vocabulary and pacing embody the specified Brand Tone.
  - **Channel Effectiveness**: Why the structure, length, and CTA maximize conversion for the specific channel.

#### 9. Multi-Format Campaign Export
- **FR-029**: System MUST provide an export action generating a formatted Markdown (`.md`) document containing the full campaign dossier: metadata, Brand Kit, Persona DNA, concept, assets, Brand Guardian validation score card, and explainability notes.
- **FR-030**: System MUST provide an export action downloading a structured JSON (`.json`) payload containing all raw campaign entities and validation results.

#### 10. AI Provider Abstraction
- **FR-031**: System MUST isolate all AI provider calls behind an AI Service Interface supporting both Google Gemini API (`gemini-1.5-flash` / `gemini-pro`) and xAI Grok API (`grok-beta` / compatible REST interface).
- **FR-032**: Active provider selection MUST be controlled via the environment variable `AI_PROVIDER` (defaulting to `gemini`).
- **FR-033**: System MUST catch AI provider timeouts, rate limits, and network errors, providing graceful error responses without crashing the backend or locking the frontend UI.
- **FR-034**: System MUST include a resilient fallback/mock response mode within the AI service layer that returns realistic, compliant pre-generated campaign assets and validation scores if provider API keys are unset or network requests fail, ensuring 100% demo continuity during live hackathon presentations.
- **FR-035**: API keys (`GEMINI_API_KEY`, `GROK_API_KEY`) MUST be read from environment variables (`.env`) and NEVER hardcoded or exposed in client bundles.

#### 11. Visual Identity & User Experience
- **FR-036**: The frontend MUST implement the approved CampaignGuard AI design system:
  - Background: Clean white and light lavender tones (`#F8F7FC` / `#FAF5FF`).
  - Primary color: Deep brand purple (`#6B21A8` / `#7C3AED`) with subtle gradients.
  - Typography: Dark navy text (`#0F172A` / `#1E1B4B`) for high-contrast readability.
  - UI components: Modern rounded cards (`rounded-xl` / `rounded-2xl`), subtle soft elevation shadows, and clean borders.
  - Iconography: Prominent shield-based branding for CampaignGuard AI and Brand Guardian.
  - Status Indicators: Emerald green for passing states (>=85 score), amber for warnings (70-84 score), and crimson red for failing states (<70 score).

---

### Key Entities

- **User**: Represents an account. Attributes: `id`, `email`, `password_hash`, `created_at`, `last_login`.
- **BrandKit**: Represents product brand rules. Attributes: `id`, `user_id`, `product_name`, `product_description`, `brand_tone`, `tagline`, `banned_words` (list), `example_brand_lines` (list), `created_at`.
- **Persona**: Represents customer profile. Attributes: `id`, `brand_kit_id`, `user_id`, `persona_name`, `primary_goals`, `pain_points`, `core_motivations`, `emotional_triggers`, `preferred_message_style`, `buying_triggers`.
- **PersonaDNA**: Synthesized strategy. Attributes: `id`, `persona_id`, `core_driver`, `value_angle`, `tone_vector`, `messaging_hooks` (list).
- **CampaignConcept**: High-level direction. Attributes: `id`, `persona_id`, `title`, `strategic_theme`, `creative_hook`, `rationale`.
- **CampaignAsset**: Specific marketing creative. Attributes: `id`, `concept_id`, `channel_type` (`social_post` | `email`), `content` (dict: headline/subject, body, cta, hashtags/preview), `created_at`.
- **BrandGuardianReport**: Quality & compliance report. Attributes: `id`, `asset_id`, `overall_score` (0-100), `status` (`pass` | `warning` | `fail`), `dimensions` (`brand_fit`, `persona_fit`, `channel_fit`, `rule_compliance`, `length_check`, `banned_words_check`), `violations` (list of strings), `diagnostic_reasoning` (string).
- **WhyThisContent**: Business explanation. Attributes: `id`, `asset_id`, `persona_reasoning`, `brand_reasoning`, `channel_reasoning`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate and complete the entire 12-step campaign generation workflow (Landing → Login → Brand Kit/Persona → Persona DNA → Concepts → Asset Gen → Brand Guardian → Auto-Fix → Why This Content → Export) in under 3 minutes of active interaction.
- **SC-002**: 100% of defined banned words present in generated copy are deterministically detected and flagged by the backend validator prior to user approval.
- **SC-003**: 100% of length-violating assets (Social Post >280 chars, Email Subject >60 chars, Email Body <75 or >250 words) are flagged with the exact character/word count variance.
- **SC-004**: The Auto-Fix engine resolves 90% or more of identified rule violations on the first attempt while preserving the selected concept and persona messaging angle.
- **SC-005**: Campaign concepts generated for distinct personas exhibit verifiable angle divergence (different emotional triggers, goals, and value propositions with >80% semantic variance).
- **SC-006**: Generated campaign assets achieve an initial Brand Guardian passing score (>=85%) on at least 80% of standard generation runs.
- **SC-007**: 100% of generated assets include an accessible, plain-language "Why This Content?" explanation covering persona, brand, and channel rationales.
- **SC-008**: Markdown (`.md`) and JSON (`.json`) exports download within 2 seconds and contain complete, uncorrupted campaign data matching the schema.
- **SC-009**: Backend test suite covers all core modules (auth, brand kit, persona, concept gen, asset gen, deterministic validators, auto-fix, export) with 100% test pass rate.

---

## Assumptions

- **Hackathon Deployment**: Application is packaged for local execution and live hackathon demonstration with React on Vite (port 5173/3000) and Flask API (port 5000).
- **Zero-Friction Local Storage**: User accounts and campaign data are persisted in local JSON files inside `backend/data/`, enabling portable zero-database demonstration without Docker or external DB services.
- **AI Connectivity**: The server has outbound internet connectivity to call Gemini API or Grok API; an abstraction layer allows switching or mocking in case of network constraint.
- **Initial Target Channels**: MVP focuses on Social Media Post (LinkedIn/X style) and Marketing Email; additional channels (Google Ads, Blog posts, SMS) are planned for future versions.
- **Browser Compatibility**: Optimized for modern desktop browsers (Chrome, Edge, Safari, Firefox).
