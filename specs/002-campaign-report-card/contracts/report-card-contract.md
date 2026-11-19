# API Contract: Campaign Report Card

**Feature**: `002-campaign-report-card`  
**Date**: 2026-11-19  
**Base URL**: `/api/campaigns`  

---

## 1. `GET /api/campaigns/{id}/report-card`

Retrieve the executive Campaign Report Card for a specific campaign. Reuses cached Brand Guardian evaluations if available.

### Request
- **Method**: `GET`
- **Headers**:
  - `Content-Type: application/json`
  - `Cookie: session=<session_token>`
- **Parameters**:
  - `id` (path, string): Unique campaign ID (e.g., `camp-travelmate-001`)

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "campaign_id": "camp-travelmate-001",
    "campaign_name": "TravelMate Smart Mug",
    "overall_score": 96,
    "grade": "A+",
    "launch_readiness": "Ready to Launch",
    "score_breakdown": {
      "brand_consistency": 96,
      "persona_relevance": 98,
      "marketing_quality": 95,
      "creativity": 94,
      "compliance": 97
    },
    "persona_impacts": [
      {
        "persona_id": "p-student",
        "persona_name": "Student",
        "relevance_score": 96,
        "primary_trigger": "Affordable convenience between study sessions"
      },
      {
        "persona_id": "p-pro",
        "persona_name": "Working Professional",
        "relevance_score": 98,
        "primary_trigger": "Desk ergonomics and uninterrupted focus"
      }
    ],
    "predicted_performance": {
      "linkedin_engagement_rate": "5.2%",
      "linkedin_benchmark": "3.8%",
      "email_open_rate": "31.2%",
      "email_benchmark": "21.5%",
      "click_through_rate": "3.9%",
      "ctr_benchmark": "2.4%"
    },
    "ai_insights": {
      "top_strengths": [
        "Strong audience differentiation between Student and Executive personas",
        "100% compliance with Brand Kit length and banned-word rules"
      ],
      "improvement_opportunities": [
        "Email subject line could incorporate more urgent call-to-action"
      ],
      "recommendations": [
        "A/B test the morning commute hook for the professional segment"
      ]
    },
    "generated_at": "2026-11-19T12:00:00Z"
  }
}
```

### Errors
- `401 Unauthorized`: Session missing or expired.
- `404 Not Found`: Campaign ID not found.
- `400 Bad Request`: Campaign has no generated assets or validation data yet.

---

## 2. `POST /api/campaigns/{id}/report-card/improve`

Generate targeted copy improvement suggestions for underperforming assets based on existing evaluation results.

### Request
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Cookie: session=<session_token>`
- **Body**:
```json
{
  "focus_areas": ["creativity", "persona_relevance"] // Optional filter
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "asset_id": "asset-email-001",
        "persona_name": "Student",
        "channel": "email",
        "current_issue": "Subject line length is near maximum (58/60 chars) and lacks curiosity gap",
        "suggested_action": "Tighten subject line to under 45 chars and lead with finals caffeine hook",
        "proposed_subject": "Fuel finals: your hot coffee between classes ☕",
        "projected_score_boost": "+3 pts"
      }
    ]
  }
}
```

---

## 3. `POST /api/campaigns/{id}/report-card/apply-improvements`

Apply suggested improvements and optionally regenerate weaker copy, immediately updating campaign assets and refreshing the report card.

### Request
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Cookie: session=<session_token>`
- **Body**:
```json
{
  "approved_asset_ids": ["asset-email-001"]
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "updated_assets_count": 1,
    "new_overall_score": 98,
    "new_grade": "A+",
    "message": "Weaker assets regenerated and report card re-scored successfully."
  }
}
```
