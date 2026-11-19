"""Deterministic brand rules validator — no AI calls."""
import re
from typing import List, Optional, Tuple

SOCIAL_POST_MAX_CHARS = 280
SOCIAL_POST_MIN_HASHTAGS = 1
SOCIAL_POST_MAX_HASHTAGS = 5
EMAIL_SUBJECT_MAX_CHARS = 60
EMAIL_BODY_MIN_WORDS = 75
EMAIL_BODY_MAX_WORDS = 250


def check_banned_words(text: str, banned_words: List[str]) -> Tuple[bool, List[str]]:
    """Regex word-boundary banned-word detection. Returns (passed, [detected_words])."""
    detected = []
    for word in banned_words:
        pattern = r"\b" + re.escape(word.lower()) + r"\b"
        if re.search(pattern, text.lower()):
            detected.append(word)
    return len(detected) == 0, detected


def check_social_post_length(text: str) -> Tuple[bool, int]:
    """Returns (passed, char_count)."""
    count = len(text)
    return count <= SOCIAL_POST_MAX_CHARS, count


def check_social_hashtags(
    text: str,
    hashtags: Optional[List[str]] = None,
    require_at_least_one: bool = False,
) -> Tuple[bool, int, List[str]]:
    """
    Deterministic hashtag count & format check for social posts.
    Validates hashtags found inline in text and/or in the explicit hashtags list.
    Returns (passed, count, normalized_hashtags).
    """
    inline_tags = re.findall(r"#[A-Za-z0-9_]+", text or "")
    explicit_tags = []
    for tag in (hashtags or []):
        cleaned = str(tag).strip()
        if cleaned:
            explicit_tags.append(cleaned if cleaned.startswith("#") else f"#{cleaned}")

    seen = set()
    combined: List[str] = []
    for t in inline_tags + explicit_tags:
        low = t.lower()
        if low not in seen:
            seen.add(low)
            combined.append(t)

    count = len(combined)
    if count > SOCIAL_POST_MAX_HASHTAGS:
        return False, count, combined
    if require_at_least_one and count < SOCIAL_POST_MIN_HASHTAGS:
        return False, count, combined
    return True, count, combined


def check_email_subject_length(subject: str) -> Tuple[bool, int]:
    """Returns (passed, char_count)."""
    count = len(subject)
    return count <= EMAIL_SUBJECT_MAX_CHARS, count


def check_email_body_word_count(body: str) -> Tuple[bool, int]:
    """Returns (passed, word_count). Must be 75-250 words."""
    count = len(body.split())
    return EMAIL_BODY_MIN_WORDS <= count <= EMAIL_BODY_MAX_WORDS, count


def validate_social_post(
    text: str,
    banned_words: List[str],
    hashtags: Optional[List[str]] = None,
) -> dict:
    combined_for_banned = f"{text} {' '.join(hashtags or [])}".strip()
    bw_passed, detected = check_banned_words(combined_for_banned, banned_words)
    len_passed, char_count = check_social_post_length(text)
    ht_passed, ht_count, ht_list = check_social_hashtags(
        text,
        hashtags=hashtags,
        require_at_least_one=(hashtags is not None),
    )

    violations = []
    if not bw_passed:
        for w in detected:
            violations.append(f"Banned word detected: '{w}'")
    if not len_passed:
        violations.append(f"Social post exceeds 280 characters ({char_count} chars)")
    if not ht_passed:
        if ht_count < SOCIAL_POST_MIN_HASHTAGS:
            violations.append("Social post must include at least 1 hashtag")
        else:
            violations.append(f"Social post has too many hashtags ({ht_count}, max {SOCIAL_POST_MAX_HASHTAGS})")

    return {
        "passed": bw_passed and len_passed and ht_passed,
        "banned_words_passed": bw_passed,
        "banned_words_detected": detected,
        "length_passed": len_passed,
        "char_count": char_count,
        "hashtags_passed": ht_passed,
        "hashtag_count": ht_count,
        "hashtags_detected": ht_list,
        "violations": violations,
    }


def validate_email(subject: str, body: str, banned_words: List[str]) -> dict:
    bw_subj_passed, subj_detected = check_banned_words(subject, banned_words)
    bw_body_passed, body_detected = check_banned_words(body, banned_words)
    subject_len_passed, subject_len = check_email_subject_length(subject)
    body_wc_passed, word_count = check_email_body_word_count(body)

    all_detected = list(set(subj_detected + body_detected))
    bw_passed = bw_subj_passed and bw_body_passed

    violations = []
    if not bw_passed:
        for w in all_detected:
            violations.append(f"Banned word detected: '{w}'")
    if not subject_len_passed:
        violations.append(f"Email subject exceeds 60 characters ({subject_len} chars)")
    if not body_wc_passed:
        if word_count < EMAIL_BODY_MIN_WORDS:
            violations.append(f"Email body too short ({word_count} words, min 75)")
        else:
            violations.append(f"Email body too long ({word_count} words, max 250)")

    return {
        "passed": bw_passed and subject_len_passed and body_wc_passed,
        "banned_words_passed": bw_passed,
        "banned_words_detected": all_detected,
        "subject_length_passed": subject_len_passed,
        "subject_char_count": subject_len,
        "body_word_count_passed": body_wc_passed,
        "word_count": word_count,
        "violations": violations,
    }
