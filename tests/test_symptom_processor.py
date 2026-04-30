import pytest
import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.symptom_processor import SymptomProcessor
from config import VOCAB_PATH, SYNONYM_PATH


@pytest.fixture
def processor():
    return SymptomProcessor()


class TestSymptomProcessor:
    def test_normalize_removes_extra_spaces(self, processor):
        assert processor.normalize_text("  fever   ") == "fever"
        assert processor.normalize_text("  high   temperature  ") == "high temperature"

    def test_normalize_lowercase(self, processor):
        assert processor.normalize_text("Fever") == "fever"
        assert processor.normalize_text("COUGH") == "cough"

    def test_parse_symptoms_from_string(self, processor):
        result = processor.parse_symptoms("Fever, Cough, Headache")
        assert result == ["fever", "cough", "headache"]

    def test_parse_symptoms_from_list(self, processor):
        result = processor.parse_symptoms(["Fever", "  Cough  ", "HEADACHE"])
        assert result == ["fever", "cough", "headache"]

    def test_exact_match(self, processor):
        canonical, success, info = processor.match_symptom("fever")
        assert success is True
        assert canonical == "fever"

    def test_synonym_match(self, processor):
        canonical, success, info = processor.match_symptom("high temperature")
        assert success is True
        assert canonical == "fever"

    def test_synonym_match_tiredness(self, processor):
        canonical, success, info = processor.match_symptom("tiredness")
        assert success is True
        assert canonical == "fatigue"

    def test_fuzzy_match_typo(self, processor):
        canonical, success, info = processor.match_symptom("fevr")
        assert success is True
        assert canonical == "fever"

    def test_fuzzy_match_spacing(self, processor):
        canonical, success, info = processor.match_symptom("  joint  pain  ")
        assert success is True
        assert canonical == "joint pain"

    def test_unknown_symptom_with_suggestion(self, processor):
        canonical, success, info = processor.match_symptom("xyznonexistent123")
        assert success is False

    def test_validate_and_normalize_mixed(self, processor):
        result = processor.validate_and_normalize(["Fever", "high temperature", "xyznonexistent123"])
        assert "fever" in result["matched"]
        assert result["matched"].count("fever") == 2 or "fever" in result["matched"]
        assert "xyznonexistent123" in result["unmatched"]

    def test_validate_deduplicates(self, processor):
        result = processor.validate_and_normalize(["fever", "fever", "fever"])
        assert result["matched"].count("fever") == 1

    def test_suggest_symptoms(self, processor):
        suggestions = processor.suggest_symptoms("fev", limit=5)
        assert len(suggestions) > 0
        assert any("fever" in s["symptom"] for s in suggestions)

    def test_suggest_empty_query(self, processor):
        suggestions = processor.suggest_symptoms("")
        assert suggestions == []

    def test_corpus_has_expected_size(self, processor):
        assert len(processor.vocabulary) >= 50

    def test_vocab_file_exists(self):
        assert os.path.exists(VOCAB_PATH)

    def test_synonym_file_exists(self):
        assert os.path.exists(SYNONYM_PATH)

    def test_vocab_valid_json(self):
        with open(VOCAB_PATH) as f:
            data = json.load(f)
        assert "vocabulary" in data
        assert isinstance(data["vocabulary"], list)
        assert len(data["vocabulary"]) >= 50

    def test_synonym_valid_json(self):
        with open(SYNONYM_PATH) as f:
            data = json.load(f)
        assert "canonical_to_aliases" in data
        assert "reverse_map" in data
