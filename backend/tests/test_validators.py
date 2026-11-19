"""TDD tests for brand_rules validators — written BEFORE implementation."""
import pytest
from app.validators.brand_rules import (
    check_banned_words,
    check_social_post_length,
    check_social_hashtags,
    check_email_subject_length,
    check_email_body_word_count,
    validate_social_post,
    validate_email,
)


class TestCheckBannedWords:
    def test_no_banned_words(self):
        passed, detected = check_banned_words("Great product!", ["cheap", "easy"])
        assert passed is True
        assert detected == []

    def test_exact_banned_word_detected(self):
        passed, detected = check_banned_words("This is cheap stuff", ["cheap"])
        assert passed is False
        assert "cheap" in detected

    def test_case_insensitive_detection(self):
        passed, detected = check_banned_words("This is CHEAP stuff", ["cheap"])
        assert passed is False
        assert "cheap" in detected

    def test_case_insensitive_mixed(self):
        passed, detected = check_banned_words("This is Cheap stuff", ["cheap"])
        assert passed is False
        assert "cheap" in detected

    def test_partial_word_not_matched(self):
        # "cheap" should NOT match "cheaply" due to word boundary
        passed, detected = check_banned_words("This is cheaply priced", ["cheap"])
        assert passed is True
        assert detected == []

    def test_partial_word_not_matched_prefix(self):
        # "easy" should NOT match "easily"
        passed, detected = check_banned_words("This is easily done", ["easy"])
        assert passed is True
        assert detected == []

    def test_multiple_banned_words(self):
        passed, detected = check_banned_words("cheap and easy solution", ["cheap", "easy"])
        assert passed is False
        assert "cheap" in detected
        assert "easy" in detected

    def test_banned_word_at_start(self):
        passed, detected = check_banned_words("cheap deal here", ["cheap"])
        assert passed is False

    def test_banned_word_at_end(self):
        passed, detected = check_banned_words("Price is cheap", ["cheap"])
        assert passed is False

    def test_empty_banned_list(self):
        passed, detected = check_banned_words("Any text here", [])
        assert passed is True
        assert detected == []

    def test_empty_text(self):
        passed, detected = check_banned_words("", ["cheap"])
        assert passed is True
        assert detected == []


class TestSocialPostLength:
    def test_exactly_280_chars_passes(self):
        text = "A" * 280
        passed, count = check_social_post_length(text)
        assert passed is True
        assert count == 280

    def test_281_chars_fails(self):
        text = "A" * 281
        passed, count = check_social_post_length(text)
        assert passed is False
        assert count == 281

    def test_short_text_passes(self):
        passed, count = check_social_post_length("Hello world")
        assert passed is True
        assert count == 11

    def test_empty_text_passes(self):
        passed, count = check_social_post_length("")
        assert passed is True
        assert count == 0


class TestEmailSubjectLength:
    def test_exactly_60_chars_passes(self):
        subject = "A" * 60
        passed, count = check_email_subject_length(subject)
        assert passed is True
        assert count == 60

    def test_61_chars_fails(self):
        subject = "A" * 61
        passed, count = check_email_subject_length(subject)
        assert passed is False
        assert count == 61

    def test_short_subject_passes(self):
        passed, count = check_email_subject_length("Hello")
        assert passed is True
        assert count == 5


class TestEmailBodyWordCount:
    def test_75_words_passes(self):
        body = " ".join(["word"] * 75)
        passed, count = check_email_body_word_count(body)
        assert passed is True
        assert count == 75

    def test_74_words_fails(self):
        body = " ".join(["word"] * 74)
        passed, count = check_email_body_word_count(body)
        assert passed is False
        assert count == 74

    def test_250_words_passes(self):
        body = " ".join(["word"] * 250)
        passed, count = check_email_body_word_count(body)
        assert passed is True
        assert count == 250

    def test_251_words_fails(self):
        body = " ".join(["word"] * 251)
        passed, count = check_email_body_word_count(body)
        assert passed is False
        assert count == 251

    def test_100_words_passes(self):
        body = " ".join(["word"] * 100)
        passed, count = check_email_body_word_count(body)
        assert passed is True


class TestValidateSocialPost:
    def test_valid_post(self):
        result = validate_social_post("Great product, buy now!", [])
        assert result["passed"] is True
        assert result["violations"] == []

    def test_post_with_banned_word(self):
        result = validate_social_post("This cheap product is great", ["cheap"])
        assert result["passed"] is False
        assert any("cheap" in v.lower() for v in result["violations"])

    def test_post_too_long(self):
        result = validate_social_post("A" * 281, [])
        assert result["passed"] is False
        assert any("280" in v or "281" in v for v in result["violations"])

    def test_post_exactly_280(self):
        result = validate_social_post("A" * 280, [])
        assert result["passed"] is True

    def test_banned_and_too_long(self):
        result = validate_social_post("cheap " + "A" * 275, ["cheap"])
        assert result["passed"] is False
        assert len(result["violations"]) >= 2


class TestValidateEmail:
    def _make_body(self, n_words=100):
        return " ".join(["word"] * n_words)

    def test_valid_email(self):
        result = validate_email("Great Subject Line", self._make_body(100), [])
        assert result["passed"] is True
        assert result["violations"] == []

    def test_banned_word_in_subject(self):
        result = validate_email("cheap deal inside", self._make_body(100), ["cheap"])
        assert result["passed"] is False
        assert any("cheap" in v.lower() for v in result["violations"])

    def test_banned_word_in_body(self):
        result = validate_email("Good Subject", self._make_body(100) + " cheap", ["cheap"])
        assert result["passed"] is False

    def test_subject_too_long(self):
        result = validate_email("A" * 61, self._make_body(100), [])
        assert result["passed"] is False
        assert any("subject" in v.lower() for v in result["violations"])

    def test_body_too_short(self):
        result = validate_email("Good Subject", self._make_body(74), [])
        assert result["passed"] is False
        assert any("short" in v.lower() or "75" in v or "74" in v for v in result["violations"])

    def test_body_too_long(self):
        result = validate_email("Good Subject", self._make_body(251), [])
        assert result["passed"] is False
        assert any("long" in v.lower() or "250" in v or "251" in v for v in result["violations"])

    def test_exact_boundaries(self):
        result = validate_email("A" * 60, self._make_body(75), [])
        assert result["passed"] is True

    def test_word_count_in_result(self):
        result = validate_email("Subject", self._make_body(100), [])
        assert result["word_count"] == 100


class TestSocialHashtags:
    def test_valid_hashtags_pass(self):
        passed, count, tags = check_social_hashtags("Stay energized! #TravelMate #CampusGear", require_at_least_one=True)
        assert passed is True
        assert count == 2
        assert "#TravelMate" in tags

    def test_missing_hashtags_fail_when_required(self):
        result = validate_social_post("Stay energized every day.", [], hashtags=[])
        assert result["passed"] is False
        assert result["hashtags_passed"] is False
        assert any("hashtag" in v.lower() for v in result["violations"])

    def test_too_many_hashtags_fail(self):
        result = validate_social_post(
            "Great mug!",
            [],
            hashtags=["#One", "#Two", "#Three", "#Four", "#Five", "#Six"],
        )
        assert result["passed"] is False
        assert result["hashtag_count"] == 6
        assert any("too many hashtags" in v.lower() for v in result["violations"])

    def test_banned_word_inside_hashtag_detected(self):
        result = validate_social_post("Great mug!", ["cheap"], hashtags=["#TravelMate", "#cheap"])
        assert result["passed"] is False
        assert "cheap" in result["banned_words_detected"]
