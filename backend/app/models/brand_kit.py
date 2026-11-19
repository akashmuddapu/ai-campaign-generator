from dataclasses import dataclass, field
from typing import List


@dataclass
class BrandKit:
    product_name: str
    product_description: str
    brand_tone: str
    tagline: str
    banned_words: List[str] = field(default_factory=list)
    example_brand_lines: List[str] = field(default_factory=list)

    @staticmethod
    def from_dict(d: dict) -> "BrandKit":
        return BrandKit(
            product_name=d.get("product_name", ""),
            product_description=d.get("product_description", ""),
            brand_tone=d.get("brand_tone", ""),
            tagline=d.get("tagline", ""),
            banned_words=d.get("banned_words", []),
            example_brand_lines=d.get("example_brand_lines", []),
        )

    def to_dict(self) -> dict:
        return {
            "product_name": self.product_name,
            "product_description": self.product_description,
            "brand_tone": self.brand_tone,
            "tagline": self.tagline,
            "banned_words": self.banned_words,
            "example_brand_lines": self.example_brand_lines,
        }
