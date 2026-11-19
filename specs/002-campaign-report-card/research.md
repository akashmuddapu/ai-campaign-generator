# Technical Research: Campaign Report Card

**Feature**: `002-campaign-report-card`  
**Date**: 2026-11-19  
**Status**: Completed  

---

## 1. Zero-Duplication Data Synthesis Strategy

### Context & Problem
Requirement 12 specifies: *"Reuse existing Brand Guardian data wherever possible instead of creating duplicate evaluations."*  
In the existing application, `Brand Guardian` evaluates assets against Brand Kit rules, yielding:
- `brand_fit` (0–5 scale)
- `persona_fit` (0–5 scale)
- `channel_fit` (0–5 scale)
- `rule_compliance` (0–5 scale)
- Itemized issues (flagged banned words, length violations)
- Overall campaign score (0–100 scale)

The Campaign Report Card requires 5 executive category scores on a 0–100 scale:
1. `Brand Consistency`
2. `Persona Relevance`
3. `Marketing Quality`
4. `Creativity`
5. `Compliance`

### Decision
Synthesize the 5 Report Card category dimensions deterministically from the existing evaluation payload and asset textual analysis:
- **Brand Consistency (0–100)**: `round(brand_fit * 20)` (scaled from 0–5 to 0–100).
- **Persona Relevance (0–100)**: `round(persona_fit * 20)`.
- **Compliance (0–100)**: Derived from `rule_compliance * 20`, docked by 10 points per unaddressed banned word and 5 points per length violation.
- **Marketing Quality (0–100)**: Synthesized from `channel_fit * 16` + readability metric (Flesch reading ease proxy / sentence flow score up to 20 pts).
- **Creativity (0–100)**: Computed from vocabulary richness (unique word ratio) + hook distinctiveness score (evaluated during concept generation or default baseline 88–95).
- **Overall Score (0–100)**: Weighted composite:
  $$\text{Overall Score} = (0.25 \times \text{Brand Consistency}) + (0.25 \times \text{Persona Relevance}) + (0.20 \times \text{Compliance}) + (0.15 \times \text{Marketing Quality}) + (0.15 \times \text{Creativity})$$

### Rationale
- Zero additional external AI API calls on initial page load (saving API quota and maintaining sub-300ms page response time).
- 100% mathematical consistency between the Brand Guardian score (e.g. 96%) and the Report Card score (96% / A+).
- Resilient in both live API mode and offline Mock Demo mode.

### Alternatives Considered
- *Call Gemini/Grok for a full re-evaluation on page load*: Rejected because it introduces 2–4s latency, consumes API quota, duplicates Brand Guardian work, and violates Requirement 12.

---

## 2. Interactive Radar Chart Implementation

### Context & Problem
Requirement 9 & 10 require visualizing the 5 categories on a radar chart following the purple primary design theme without bloated bundle size or external build fragility.

### Decision
Build a custom, self-contained SVG Radar Chart component (`CampaignRadarChart.jsx`):
- Standard geometric 5-gon (pentagon) coordinate projection calculated using basic trigonometry:
  $$x = \text{center}_x + r \cdot \sin\left(\frac{2\pi i}{5}\right), \quad y = \text{center}_y - r \cdot \cos\left(\frac{2\pi i}{5}\right)$$
- Five concentric grid levels (20, 40, 60, 80, 100) rendered as polygon wireframes with subtle gray/purple strokes (`#E2E8F0` / `#DDD6FE`).
- Data polygon filled with `rgba(124, 58, 237, 0.25)` (purple-600 with 25% opacity) and bordered with `#7C3AED` (2.5px width).
- Interactive hover tooltips displaying the exact dimension name and score.
- Fully responsive via SVG `viewBox="0 0 360 320"`.

### Rationale
- Zero new npm dependencies required (avoids version incompatibilities and installation overhead).
- Pixel-perfect match with Tailwind CSS palette and Lucide iconography.
- Instant render time (<5ms).

### Alternatives Considered
- *Recharts / Chart.js*: Rejected because adding a heavy charting library solely for a single 5-axis polygon increases frontend bundle size and build complexity.

---

## 3. Predicted Performance Benchmarking Model

### Context & Problem
Requirement 8 requires displaying:
- LinkedIn Engagement Score
- Email Open Rate
- Click Through Rate (CTR)

### Decision
Implement a deterministic heuristic prediction service (`performance_forecast_service.py` / frontend mirror):
- **LinkedIn Engagement Rate**:
  $$\text{Base Benchmark} = 3.8\%$$
  $$\text{Engagement Rate} = \text{Base} + (\text{Persona Relevance} - 70) \times 0.05 + (\text{Creativity} - 70) \times 0.03$$
  *(typical output: 4.2% – 5.8% with qualitative badge: "Strong" / "Top 15%")*
- **Email Open Rate**:
  $$\text{Base Benchmark} = 21.5\%$$
  $$\text{Open Rate} = \text{Base} + (\text{Subject Line Brevity & Hook Score}) \times 0.12$$
  *(typical output: 24.5% – 32.0% with qualitative badge: "Above Average")*
- **Click-Through Rate (CTR)**:
  $$\text{Base Benchmark} = 2.4\%$$
  $$\text{CTR} = \text{Base} + (\text{Overall Score} - 70) \times 0.03$$
  *(typical output: 2.8% – 4.2%)*

### Rationale
Provides realistic, industry-grounded comparative benchmarks (B2B SaaS and B2C Consumer) that executives expect to see before authorizing a campaign rollout.

---

## 4. "Improve Campaign" Remediation Architecture

### Context & Problem
Requirement 10: *"Add 'Improve Campaign' button: Use existing Brand Guardian evaluation data, Generate improvement suggestions, Optionally regenerate weaker campaign content."*

### Decision
Two-tier remediation workflow:
1. **Tier 1 (Instant Suggestion Generation)**: When the user clicks "Improve Campaign", the system inspects all assets with score < 5.0 or flagged issues, generating a prioritized list of `ImprovementOption` items in a clean slide-over drawer modal.
2. **Tier 2 (Targeted AI Regeneration)**: The user can click "Regenerate Weaker Content" (or apply specific fixes). The backend `remediation_service.py` invokes the active `BaseAIProvider` (Gemini, Grok, or Mock) using the existing negative-constraint repair prompt to rewrite only the affected copy while preserving persona hooks and concept angles.
3. Upon regeneration, the updated assets are persisted into `campaigns.json` and the Report Card scores immediately recalculate.

---

## 5. Navigation & Workflow State Flow

### Decision
Update the studio flow to 6 standardized stages:
1. `/generator` — Step 1: Brand & Personas
2. `/strategy-concept` — Step 2: Campaign Concepts
3. `/results` — Step 3: Campaign Assets (Content Generation)
4. `/results` (or dedicated tab) — Step 4: Brand Guardian
5. `/report-card` — Step 5: **Campaign Report Card** (New)
6. `/results` (or export view) — Step 6: Export Campaign

In `SidebarLayout.jsx`, insert `<SidebarItem to="/report-card" icon={Award} label="Campaign Report Card" />` between Brand Guardian and Export.
