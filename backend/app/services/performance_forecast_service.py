"""Performance forecast service — predictive channel engagement benchmarks."""
from typing import Dict, Any


def calculate_predicted_performance(
    overall_score: int,
    persona_relevance: int = 90,
    creativity: int = 90,
    brand_consistency: int = 90,
    subject_length: int = 42
) -> Dict[str, str]:
    """
    Computes benchmark-grounded channel engagement predictions:
    1. LinkedIn Engagement Rate (baseline 3.8%)
    2. Email Open Rate (baseline 21.5%)
    3. Click-Through Rate (baseline 2.4%)
    """
    # 1. LinkedIn Engagement (typical range: 3.5% - 6.2%)
    li_delta = (persona_relevance - 75) * 0.04 + (creativity - 75) * 0.02
    li_rate = max(2.5, min(7.5, 3.8 + li_delta))

    # 2. Email Open Rate (typical range: 22% - 36%)
    # Optimal subject line length is 30-50 chars
    subject_bonus = 2.0 if 25 <= subject_length <= 50 else -1.5
    email_delta = (brand_consistency - 75) * 0.15 + subject_bonus
    email_rate = max(18.0, min(42.0, 21.5 + email_delta))

    # 3. Click-Through Rate (typical range: 2.0% - 4.8%)
    ctr_delta = (overall_score - 75) * 0.03
    ctr_rate = max(1.5, min(5.5, 2.4 + ctr_delta))

    return {
        "linkedin_engagement_rate": f"{li_rate:.1f}%",
        "linkedin_benchmark": "3.8%",
        "email_open_rate": f"{email_rate:.1f}%",
        "email_benchmark": "21.5%",
        "click_through_rate": f"{ctr_rate:.1f}%",
        "ctr_benchmark": "2.4%",
    }
