import uuid
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class CampaignConcept:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    angle: str = ""
    hook: str = ""
    tone: str = ""
    rationale: str = ""

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "angle": self.angle,
            "hook": self.hook,
            "tone": self.tone,
            "rationale": self.rationale,
        }


@dataclass
class DimensionResult:
    dimension: str
    passed: bool
    score: int
    explanation: str
    violations: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "dimension": self.dimension,
            "passed": self.passed,
            "score": self.score,
            "explanation": self.explanation,
            "violations": self.violations,
        }


@dataclass
class BrandGuardianReport:
    overall_score: int
    passed: bool
    dimensions: List[DimensionResult] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "overall_score": self.overall_score,
            "passed": self.passed,
            "dimensions": [d.to_dict() for d in self.dimensions],
            "recommendations": self.recommendations,
        }


@dataclass
class WhyThisContent:
    persona_rationale: str
    brand_rationale: str
    channel_rationale: str
    angle_explanation: str
    audience_impact: str

    def to_dict(self) -> dict:
        return {
            "persona_rationale": self.persona_rationale,
            "brand_rationale": self.brand_rationale,
            "channel_rationale": self.channel_rationale,
            "angle_explanation": self.angle_explanation,
            "audience_impact": self.audience_impact,
        }


@dataclass
class SocialPostContent:
    text: str
    character_count: int = 0
    hashtags: List[str] = field(default_factory=list)

    def __post_init__(self):
        self.character_count = len(self.text)

    def to_dict(self) -> dict:
        return {
            "text": self.text,
            "character_count": self.character_count,
            "hashtags": self.hashtags,
        }


@dataclass
class EmailContent:
    subject: str
    body: str
    word_count: int = 0

    def __post_init__(self):
        self.word_count = len(self.body.split())

    def to_dict(self) -> dict:
        return {
            "subject": self.subject,
            "body": self.body,
            "word_count": self.word_count,
        }
