from dataclasses import dataclass, field
from typing import List


@dataclass
class Persona:
    persona_name: str
    primary_goals: str = ""
    pain_points: str = ""
    core_motivations: str = ""
    emotional_triggers: str = ""
    preferred_message_style: str = ""
    buying_triggers: str = ""

    @staticmethod
    def from_dict(d: dict) -> "Persona":
        return Persona(
            persona_name=d.get("persona_name", ""),
            primary_goals=d.get("primary_goals", ""),
            pain_points=d.get("pain_points", ""),
            core_motivations=d.get("core_motivations", ""),
            emotional_triggers=d.get("emotional_triggers", ""),
            preferred_message_style=d.get("preferred_message_style", ""),
            buying_triggers=d.get("buying_triggers", ""),
        )

    def to_dict(self) -> dict:
        return {
            "persona_name": self.persona_name,
            "primary_goals": self.primary_goals,
            "pain_points": self.pain_points,
            "core_motivations": self.core_motivations,
            "emotional_triggers": self.emotional_triggers,
            "preferred_message_style": self.preferred_message_style,
            "buying_triggers": self.buying_triggers,
        }


@dataclass
class PersonaDNA:
    persona_name: str
    audience_summary: str
    core_value_angle: str
    tone_vector: str
    primary_hook: str
    psychological_drivers: List[str] = field(default_factory=list)
    differentiation_strategy: str = ""

    def to_dict(self) -> dict:
        return {
            "persona_name": self.persona_name,
            "audience_summary": self.audience_summary,
            "core_value_angle": self.core_value_angle,
            "tone_vector": self.tone_vector,
            "primary_hook": self.primary_hook,
            "psychological_drivers": self.psychological_drivers,
            "differentiation_strategy": self.differentiation_strategy,
        }
