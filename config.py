import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA = os.path.join(DATA_DIR, "raw", "disease_symptoms.csv")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "models", "artifacts")

MODEL_PATH = os.path.join(ARTIFACTS_DIR, "ensemble.pkl")
ENCODER_PATH = os.path.join(ARTIFACTS_DIR, "symptom_encoder.pkl")
SYNONYM_PATH = os.path.join(DATA_DIR, "synonym_map.json")
VOCAB_PATH = os.path.join(DATA_DIR, "symptom_vocab.json")
METADATA_PATH = os.path.join(ARTIFACTS_DIR, "metadata.json")

MIN_CONFIDENCE_HIGH = 0.70
MIN_CONFIDENCE_MEDIUM = 0.40
FUZZY_MATCH_THRESHOLD = 85
MAX_PREDICTIONS = 3
MIN_SYMPTOMS = 2
