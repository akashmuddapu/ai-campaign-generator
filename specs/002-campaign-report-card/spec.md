# Feature Specification: Campaign Report Card

**Feature Branch**: `002-campaign-report-card`  
**Created**: 2026-11-19  
**Status**: Ready for Review  
**Input**: User description: "Add a new feature called 'Campaign Report Card' to the existing AI Marketing Campaign Generator. Insert this feature between the existing Brand Guardian and Export Campaign steps. Current flow: Campaign Assets → Brand Guardian → Export Campaign. New flow: Campaign Assets → Brand Guardian → Campaign Report Card → Export Campaign. Feature Scope: Create a Campaign Report Card page that acts as the final review stage before export. Requirements: 1. Add a new navigation tab named 'Campaign Report Card' between Brand Guardian and Export. 2. Display overall campaign score out of 100. 3. Display campaign grade: A+, A, B, C, D. 4. Display score breakdown cards: Brand Consistency, Persona Relevance, Marketing Quality, Creativity, Compliance. 5. Display Launch Readiness status: Ready to Launch, Launch with Improvements, Needs Revision. 6. Display AI Insights section: Top Strengths, Improvement Opportunities, Recommendations. 7. Display Persona Impact Analysis: Persona Name, Relevance Score, Primary Marketing Trigger. 8. Display Predicted Performance: LinkedIn Engagement Score, Email Open Rate, Click Through Rate. 9. Include a radar chart using: Brand Consistency, Persona Relevance, Marketing Quality, Creativity, Compliance. 10. Add 'Improve Campaign' button: Use existing Brand Guardian evaluation data, Generate improvement suggestions, Optionally regenerate weaker campaign content. 11. Follow the existing Brand Guardian page design language: Purple theme, Dashboard cards, Rounded panels, Modern analytics look. 12. Reuse existing Brand Guardian data wherever possible instead of creating duplicate evaluations. Acceptance Criteria: New Report Card tab appears between Brand Guardian and Export. Report card displays overall score and grade. Radar chart is visible. Persona impact section is visible. AI recommendations section is visible. Launch readiness decision is visible. Improve Campaign button works with current campaign data. User can review campaign quality before exporting."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Executive Campaign Quality & Launch Readiness (Priority: P1)

As a marketing leader or business executive,  
I want to view an executive-level summary dashboard with an overall score (out of 100), letter grade (A+ through D), launch readiness badge, and 5-dimension radar chart,  
So that I can determine within 5 seconds whether the campaign is ready for market or requires revision before export.

**Why this priority**: Core value of the feature; serves as the primary executive review and gatekeeper before campaign assets are finalized or exported.

**Independent Test**: Can be tested independently by loading a validated campaign into the Report Card view and verifying that the overall score, calculated letter grade (`A+`, `A`, `B`, `C`, or `D`), launch readiness decision (`Ready to Launch`, `Launch with Improvements`, or `Needs Revision`), and 5-axis radar chart accurately reflect the campaign's aggregated health.

**Acceptance Scenarios**:

1. **Given** a generated campaign with validation data, **When** the user accesses the Campaign Report Card page, **Then** the screen renders the overall score out of 100, the letter grade (`A+`, `A`, `B`, `C`, or `D`), and a prominent Launch Readiness badge.
2. **Given** an overall score of 96 with zero compliance errors, **When** the Report Card is rendered, **Then** the grade displays `A+` and the Launch Readiness badge displays `Ready to Launch`.
3. **Given** an overall score of 78 or minor non-blocking flags, **When** the Report Card is rendered, **Then** the grade displays `C` (or `B`) and the Launch Readiness badge displays `Launch with Improvements`.
4. **Given** an overall score below 70 or active banned word violations, **When** the Report Card is rendered, **Then** the grade displays `D` and the Launch Readiness badge displays `Needs Revision`.
5. **Given** the 5 score categories (Brand Consistency, Persona Relevance, Marketing Quality, Creativity, Compliance), **When** viewed on the dashboard, **Then** a 5-axis radar chart visually represents all 5 dimensions on a 0–100 scale.

---

### User Story 2 - Persona Impact & Performance Forecasting with Zero Data Duplication (Priority: P1)

As a growth marketer or campaign strategist,  
I want to inspect score breakdown cards, persona-specific relevance metrics, and predicted channel engagement,  
So that I can verify segment differentiation and estimated ROI by reusing existing Brand Guardian evaluations without triggering redundant API calls.

**Why this priority**: Maximizes performance and cost efficiency while providing granular validation of how each distinct customer segment will respond to the copy.

**Independent Test**: Can be tested independently by verifying that the Report Card loads existing Brand Guardian evaluation results without triggering duplicate re-evaluations, and renders score breakdown cards, Persona Impact Analysis, and Predicted Performance metrics.

**Acceptance Scenarios**:

1. **Given** existing evaluation data from the Brand Guardian step, **When** the Report Card is generated, **Then** the 5 score breakdown cards (Brand Consistency, Persona Relevance, Marketing Quality, Creativity, Compliance) are populated directly from existing evaluation data without triggering duplicate evaluation calls.
2. **Given** target campaign personas, **When** viewing the Persona Impact Analysis section, **Then** each persona displays: Persona Name, Relevance Score (0–100), and Primary Marketing Trigger (core psychological hook).
3. **Given** the Predicted Performance section, **When** rendered, **Then** the user sees forecasted benchmark metrics for LinkedIn Engagement Score, Email Open Rate, and Click-Through Rate (CTR).

---

### User Story 3 - AI Insights & Actionable Campaign Improvement (Priority: P2)

As a content creator or copywriter,  
I want an AI Insights summary (Top Strengths, Improvement Opportunities, Recommendations) and an "Improve Campaign" action,  
So that I can understand copy trade-offs and optionally regenerate weaker campaign content before exporting.

**Why this priority**: Empowers marketers to continuously refine and elevate campaign quality directly from the report card rather than manually guessing how to fix flagged content.

**Independent Test**: Can be tested by clicking the "Improve Campaign" button and verifying that improvement suggestions are derived from existing evaluation data and weaker content can be regenerated with 1 click.

**Acceptance Scenarios**:

1. **Given** the AI Insights section, **When** viewed, **Then** it displays three distinct analytical panels: Top Strengths, Improvement Opportunities, and Strategic Recommendations.
2. **Given** a campaign with weaker assets or suboptimal persona relevance, **When** the user clicks "Improve Campaign", **Then** the system presents structured improvement suggestions mapped to specific assets.
3. **Given** improvement suggestions, **When** the user confirms regeneration of weaker content, **Then** the system regenerates the targeted assets, updates the campaign state, and recalculates the report card metrics.

---

### User Story 4 - Seamless Studio Stepper & Navigation Flow (Priority: P2)

As a studio user completing a campaign creation workflow,  
I want "Campaign Report Card" integrated between Brand Guardian and Export Campaign in both the sidebar and top stepper,  
So that the review experience feels like a natural final review gate before campaign export.

**Why this priority**: Ensures end-to-end UX continuity across the entire creation wizard.

**Independent Test**: Can be tested by navigating through the wizard from Campaign Assets → Brand Guardian → Campaign Report Card → Export Campaign.

**Acceptance Scenarios**:

1. **Given** the studio navigation header stepper, **When** rendered, **Then** the tabs display: `Campaign Assets → Brand Guardian → Campaign Report Card → Export Campaign`.
2. **Given** the studio sidebar navigation, **When** viewing campaign tools, **Then** "Campaign Report Card" appears between "Brand Guardian" and "Export".
3. **Given** the user is on the Brand Guardian page, **When** clicking the forward primary button, **Then** it navigates to "Campaign Report Card".
4. **Given** the user is on the Campaign Report Card page, **When** clicking "Proceed to Export", **Then** it navigates directly to the Export Campaign view.

---

### Edge Cases

- **Campaign with unvalidated assets**: If a user navigates directly to the Report Card URL before completing asset generation or Brand Guardian evaluation, the system MUST show an informative prompt stating "Campaign validation required" with a direct button to run Brand Guardian.
- **Campaign with "Needs Revision" status**: If the overall grade is `D` or critical banned words exist, the system MUST display a warning indicator beside the "Proceed to Export" button, prompting the user to run "Improve Campaign" first.
- **Single persona vs. multi-persona campaigns**: The Persona Impact Analysis section MUST adaptively display 1 to 5+ personas with responsive card/grid formatting.
- **Zero redundant API overhead**: Accessing or re-visiting the Report Card MUST NOT re-invoke external LLM evaluation endpoints if Brand Guardian data is already cached.
- **Mobile & responsive viewports**: The radar chart and score cards MUST adjust dynamically to single-column stacking on screen widths below 768px without horizontal clipping.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated route and page component for `Campaign Report Card` inserted between Brand Guardian and Export Campaign.
- **FR-002**: System MUST calculate and display an Overall Campaign Score on a 0–100 integer scale.
- **FR-003**: System MUST calculate and render a standardized Campaign Grade based on the overall score:
  - `A+`: 95–100
  - `A`: 90–94
  - `B`: 80–89
  - `C`: 70–79
  - `D`: Below 70
- **FR-004**: System MUST display 5 Score Breakdown Cards with numerical ratings and visual indicators:
  - `Brand Consistency` (0–100)
  - `Persona Relevance` (0–100)
  - `Marketing Quality` (0–100)
  - `Creativity` (0–100)
  - `Compliance` (0–100)
- **FR-005**: System MUST compute and display one of three Launch Readiness statuses:
  - `Ready to Launch` (Score >= 85 and zero compliance errors)
  - `Launch with Improvements` (Score 70–84 or non-critical issues)
  - `Needs Revision` (Score < 70 or active banned word/length violations)
- **FR-006**: System MUST render an interactive Radar Chart plotting the 5 score categories (Brand Consistency, Persona Relevance, Marketing Quality, Creativity, Compliance) on a 5-axis polygon.
- **FR-007**: System MUST provide an AI Insights section comprising three distinct panels:
  - `Top Strengths` (list of key highlights where campaign copy excels)
  - `Improvement Opportunities` (areas where tone, length, or hooks can be sharpened)
  - `Recommendations` (actionable guidance for distribution and channel targeting)
- **FR-008**: System MUST display a Persona Impact Analysis for all personas included in the campaign, featuring:
  - Persona Name and role title
  - Relevance Score (0–100)
  - Primary Marketing Trigger (psychological hook or value proposition)
- **FR-009**: System MUST display a Predicted Performance section showing estimated channel response benchmarks:
  - `LinkedIn Engagement Score` (estimated engagement percentage vs. benchmark)
  - `Email Open Rate` (estimated open percentage vs. industry benchmark)
  - `Click-Through Rate (CTR)` (estimated CTR percentage vs. industry benchmark)
- **FR-010**: System MUST provide an "Improve Campaign" action button that analyzes existing Brand Guardian evaluation data to generate targeted copy improvement suggestions.
- **FR-011**: System MUST allow users to optionally regenerate weaker campaign content using the improvement recommendations, immediately updating campaign assets and refreshing Report Card scores.
- **FR-012**: System MUST reuse existing Brand Guardian evaluation results wherever possible, avoiding duplicate AI evaluation requests when generating or viewing the Report Card.
- **FR-013**: System MUST adhere to the approved Brand Guardian page design language: purple primary palette (`#6B21A8` / `#7C3AED`), rounded panels, dashboard metric cards, and modern analytics layout.
- **FR-014**: System MUST update the Studio Sidebar to include "Campaign Report Card" with an appropriate icon between Brand Guardian and Export.
- **FR-015**: System MUST update the Studio top stepper navigation to reflect the updated 6-step lifecycle: Brand & Personas → Campaign Concepts → Campaign Assets → Brand Guardian → Campaign Report Card → Export Campaign.
- **FR-016**: System MUST persist the Report Card summary data in the campaign record so that historical campaigns viewed in Campaign History display their executive report card.

---

### Key Entities

- **CampaignReportCard**:
  - `campaign_id`: Unique identifier referencing the parent campaign
  - `overall_score`: Integer (0–100)
  - `grade`: String enum (`A+`, `A`, `B`, `C`, `D`)
  - `launch_readiness`: String enum (`Ready to Launch`, `Launch with Improvements`, `Needs Revision`)
  - `score_breakdown`: `ScoreBreakdown` object
  - `persona_impacts`: Array of `PersonaImpact` objects
  - `predicted_performance`: `PredictedPerformance` object
  - `ai_insights`: `AIInsights` object
  - `generated_at`: ISO 8601 timestamp

- **ScoreBreakdown**:
  - `brand_consistency`: Number (0–100)
  - `persona_relevance`: Number (0–100)
  - `marketing_quality`: Number (0–100)
  - `creativity`: Number (0–100)
  - `compliance`: Number (0–100)

- **PersonaImpact**:
  - `persona_id`: String identifier
  - `persona_name`: String name (e.g., "Student", "Enterprise CISO")
  - `relevance_score`: Number (0–100)
  - `primary_trigger`: String description of psychological hook

- **PredictedPerformance**:
  - `linkedin_engagement_score`: String (e.g., "4.8% — High")
  - `email_open_rate`: String (e.g., "28.5% — Above Average")
  - `click_through_rate`: String (e.g., "3.6% — Strong")

- **AIInsights**:
  - `top_strengths`: Array of strings
  - `improvement_opportunities`: Array of strings
  - `recommendations`: Array of strings

- **ImprovementOption**:
  - `asset_id`: String identifier of asset to improve
  - `persona_name`: Target persona name
  - `channel`: String (`social_post` | `email`)
  - `current_issue`: Description of weakness
  - `suggested_revision`: Proposed copy or prompt direction

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **5-Second Executive Assessment**: 95% of test users can state the overall campaign score, letter grade, and launch readiness within 5 seconds of opening the Report Card.
- **SC-002**: **Zero Duplicate Evaluation Calls**: 100% of score categories and insights reuse pre-computed Brand Guardian data on initial load without making redundant LLM evaluation calls.
- **SC-003**: **Complete Persona Visibility**: 100% of personas defined in the campaign are represented with a relevance score and primary marketing trigger.
- **SC-004**: **1-Click Actionable Improvement**: Users clicking "Improve Campaign" receive actionable remediation suggestions within 2 seconds.
- **SC-005**: **Fluid Stepper Navigation**: 100% of user sessions can transition forward from Brand Guardian → Report Card → Export without state loss or broken routes.
- **SC-006**: **Design Language Parity**: Report Card UI visually matches the Brand Guardian color tokens, rounded cards, and typography guidelines across desktop and tablet viewports.

---

## Assumptions

- **Brand Guardian Prerequisite**: The Report Card relies on data generated during the Campaign Assets and Brand Guardian steps; if accessed directly on an incomplete campaign, it prompts users to complete those steps first.
- **Heuristic Performance Model**: Channel response forecasts (LinkedIn engagement, email open rate, CTR) are benchmark-driven predictive estimates based on copy readability, tone alignment, and industry averages.
- **Deterministic Grade Rubric**: Letter grades strictly follow the designated thresholds (`A+`: 95–100, `A`: 90–94, `B`: 80–89, `C`: 70–79, `D`: <70).
- **Reusable Data Mapping**: Brand Consistency maps from Brand Guardian's Brand Fit; Persona Relevance maps from Persona Fit; Compliance maps from Rule Compliance; Marketing Quality & Creativity are synthesized from channel fit and readability heuristics.
- **Export Integration**: The Report Card executive summary is prepended to the final exported campaign dossier in Markdown and JSON formats.
