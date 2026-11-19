import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional


@dataclass
class ScoreBreakdown:
    brand_consistency: int = 90
    persona_relevance: int = 90
    marketing_quality: int = 90
    creativity: int = 90
    compliance: int = 90

    def to_dict(self) -> Dict[str, int]:
        return {
            "brand_consistency": self.brand_consistency,
            "persona_relevance": self.persona_relevance,
            "marketing_quality": self.marketing_quality,
            "creativity": self.creativity,
            "compliance": self.compliance,
        }


@dataclass
class PersonaImpact:
    persona_id: str
    persona_name: str
    relevance_score: int
    primary_trigger: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "persona_id": self.persona_id,
            "persona_name": self.persona_name,
            "relevance_score": self.relevance_score,
            "primary_trigger": self.primary_trigger,
        }


@dataclass
class PredictedPerformance:
    linkedin_engagement_rate: str = "4.8%"
    linkedin_benchmark: str = "3.8%"
    email_open_rate: str = "28.4%"
    email_benchmark: str = "21.5%"
    click_through_rate: str = "3.6%"
    ctr_benchmark: str = "2.4%"

    def to_dict(self) -> Dict[str, str]:
        return {
            "linkedin_engagement_rate": self.linkedin_engagement_rate,
            "linkedin_benchmark": self.linkedin_benchmark,
            "email_open_rate": self.email_open_rate,
            "email_benchmark": self.email_benchmark,
            "click_through_rate": self.click_through_rate,
            "ctr_benchmark": self.ctr_benchmark,
        }


@dataclass
class AIInsights:
    top_strengths: List[str] = field(default_factory=list)
    improvement_opportunities: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, List[str]]:
        return {
            "top_strengths": self.top_strengths,
            "improvement_opportunities": self.improvement_opportunities,
            "recommendations": self.recommendations,
        }


@dataclass
class ImprovementOption:
    asset_id: str
    persona_name: str
    channel: str
    current_issue: str
    suggested_action: str
    proposed_subject: Optional[str] = None
    proposed_text: Optional[str] = None
    projected_score_boost: str = "+3 pts"

    def to_dict(self) -> Dict[str, Any]:
        res = {
            "asset_id": self.asset_id,
            "persona_name": self.persona_name,
            "channel": self.channel,
            "current_issue": self.current_issue,
            "suggested_action": self.suggested_action,
            "projected_score_boost": self.projected_score_boost,
        }
        if self.proposed_subject:
            res["proposed_subject"] = self.proposed_subject
        if self.proposed_text:
            res["proposed_text"] = self.proposed_text
        return res


@dataclass
class CampaignReportCard:
    campaign_id: str
    overall_score: int
    grade: str
    launch_readiness: str
    score_breakdown: ScoreBreakdown
    persona_impacts: List[PersonaImpact] = field(default_factory=list)
    predicted_performance: PredictedPerformance = field(default_factory=PredictedPerformance)
    ai_insights: AIInsights = field(default_factory=AIInsights)
    id: str = field(default_factory=lambda: f"rc-{uuid.uuid4().hex[:8]}")
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "overall_score": self.overall_score,
            "grade": self.grade,
            "launch_readiness": self.launch_readiness,
            "score_breakdown": self.score_breakdown.to_dict(),
            "persona_impacts": [p.to_dict() for p in self.persona_impacts],
            "predicted_performance": self.predicted_performance.to_dict(),
            "ai_insights": self.ai_insights.to_dict(),
            "generated_at": self.generated_at,
        }
