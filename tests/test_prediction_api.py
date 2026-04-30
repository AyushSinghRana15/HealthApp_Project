import pytest
import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture
def client():
    from app import app
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "healthy"
        assert "n_diseases" in data
        assert "n_symptoms" in data


class TestPredictEndpoint:
    def test_predict_with_valid_symptoms(self, client):
        res = client.post("/predict", json={
            "symptoms": ["fever", "cough", "fatigue"]
        })
        assert res.status_code == 200
        data = res.get_json()
        assert "predictions" in data
        assert len(data["predictions"]) > 0
        assert "confidence" in data
        assert data["confidence"] in ["high", "medium", "low"]
        assert "disclaimer" in data

    def test_predict_returns_probabilities(self, client):
        res = client.post("/predict", json={
            "symptoms": ["fever", "cough", "fatigue"]
        })
        data = res.get_json()
        for pred in data["predictions"]:
            assert "disease" in pred
            assert "probability" in pred
            assert 0 <= pred["probability"] <= 1

    def test_predict_missing_symptoms_field(self, client):
        res = client.post("/predict", json={})
        assert res.status_code == 400
        data = res.get_json()
        assert "error" in data

    def test_predict_no_json(self, client):
        res = client.post("/predict", data="not json", content_type="text/plain")
        assert res.status_code == 400

    def test_predict_fuzzy_symptoms(self, client):
        res = client.post("/predict", json={
            "symptoms": ["fevr", "kof", "tiredness"]
        })
        assert res.status_code == 200
        data = res.get_json()
        assert "predictions" in data or "error" in data

    def test_predict_with_symptom_validation(self, client):
        res = client.post("/predict", json={
            "symptoms": ["Fever", "high temperature", "Cough"]
        })
        assert res.status_code == 200
        data = res.get_json()
        assert "symptom_validation" in data


class TestSymptomSuggestEndpoint:
    def test_suggest_with_query(self, client):
        res = client.get("/symptoms/suggest?q=fev")
        assert res.status_code == 200
        data = res.get_json()
        assert "suggestions" in data
        assert len(data["suggestions"]) > 0

    def test_suggest_empty_query(self, client):
        res = client.get("/symptoms/suggest?q=")
        assert res.status_code == 200
        data = res.get_json()
        assert data["suggestions"] == []


class TestSymptomValidateEndpoint:
    def test_validate_mixed_symptoms(self, client):
        res = client.post("/symptoms/validate", json={
            "symptoms": ["fever", "high temperature", "xyznonexistent"]
        })
        assert res.status_code == 200
        data = res.get_json()
        assert "matched" in data
        assert "unmatched" in data
        assert "corrections" in data
        assert len(data["matched"]) > 0
        assert len(data["unmatched"]) > 0


class TestDiseaseInfoEndpoint:
    def test_get_known_disease(self, client):
        res = client.get("/disease/Influenza")
        assert res.status_code == 200
        data = res.get_json()
        assert "name" in data
        assert "description" in data

    def test_get_unknown_disease(self, client):
        res = client.get("/disease/SomeFakeDisease")
        assert res.status_code == 200
        data = res.get_json()
        assert data["name"] == "Somefakedisease"


class TestDiseasesListEndpoint:
    def test_list_diseases(self, client):
        res = client.get("/diseases")
        assert res.status_code == 200
        data = res.get_json()
        assert "diseases" in data
        assert len(data["diseases"]) > 0
        assert "total" in data
