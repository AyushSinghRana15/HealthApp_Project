import json
import re
from rapidfuzz import process, fuzz
from config import FUZZY_MATCH_THRESHOLD, SYNONYM_PATH, VOCAB_PATH


class SymptomProcessor:
    def __init__(self):
        with open(VOCAB_PATH, 'r') as f:
            data = json.load(f)
        self.vocabulary = data["vocabulary"]

        with open(SYNONYM_PATH, 'r') as f:
            syn_data = json.load(f)
        self.reverse_syn_map = syn_data["reverse_map"]

    def normalize_text(self, text):
        text = text.strip().lower()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[,;:.!]+$', '', text)
        return text

    def parse_symptoms(self, raw_input):
        if isinstance(raw_input, list):
            return [self.normalize_text(s) for s in raw_input if s.strip()]
        parts = [p.strip() for p in raw_input.split(',')]
        return [self.normalize_text(p) for p in parts if p.strip()]

    def match_symptom(self, symptom):
        normalized = self.normalize_text(symptom)

        if normalized in self.reverse_syn_map:
            canonical = self.reverse_syn_map[normalized]
            return canonical, True, None

        if normalized in self.vocabulary:
            return normalized, True, None

        result = process.extractOne(
            normalized,
            self.vocabulary,
            scorer=fuzz.WRatio,
            score_cutoff=FUZZY_MATCH_THRESHOLD
        )

        if result:
            match, score, _ = result
            return match, True, score

        closest = process.extractOne(
            normalized,
            self.vocabulary,
            scorer=fuzz.WRatio,
            score_cutoff=40
        )

        if closest:
            suggestion, score, _ = closest
            return None, False, suggestion

        return None, False, None

    def validate_and_normalize(self, raw_symptoms):
        parsed = self.parse_symptoms(raw_symptoms)
        matched = []
        unmatched = []
        corrections = {}

        for s in parsed:
            canonical, success, info = self.match_symptom(s)
            if success:
                matched.append(canonical)
                if info and info != 100:
                    corrections[s] = canonical
            else:
                unmatched.append(s)
                if info:
                    corrections[s] = info

        return {
            "matched": list(dict.fromkeys(matched)),
            "unmatched": unmatched,
            "corrections": corrections,
            "total_input": len(parsed),
            "total_matched": len(matched)
        }

    def suggest_symptoms(self, query, limit=10):
        q = self.normalize_text(query)
        if not q:
            return []

        results = process.extract(
            q,
            self.vocabulary,
            scorer=fuzz.WRatio,
            limit=limit,
            score_cutoff=30
        )

        return [{"symptom": match, "score": score} for match, score, _ in results]
