import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.model_selection import cross_val_score, LeaveOneOut
from sklearn.metrics import accuracy_score
import pandas as pd
import json
import os
from config import PROCESSED_DIR, ARTIFACTS_DIR, MODEL_PATH, ENCODER_PATH, METADATA_PATH


class PredictionEngine:
    def __init__(self):
        self.models = {}
        self.model_weights = {}
        self.mlb = None
        self.label_encoder = None
        self.disease_labels = []
        self.metadata = {}

    def load_artifacts(self):
        ensemble_data = joblib.load(MODEL_PATH)
        self.models = ensemble_data["models"]
        self.model_weights = ensemble_data["weights"]
        self.mlb = joblib.load(ENCODER_PATH)["mlb"]
        self.label_encoder = joblib.load(ENCODER_PATH)["label_encoder"]
        self.disease_labels = list(self.label_encoder.classes_)
        with open(METADATA_PATH, 'r') as f:
            self.metadata = json.load(f)

    def predict(self, symptoms_list):
        input_vector = self.mlb.transform([symptoms_list])
        predictions = {}
        for name, model in self.models.items():
            if hasattr(model, "predict_proba"):
                predictions[name] = model.predict_proba(input_vector)[0]
            else:
                preds = model.predict(input_vector)
                proba = np.zeros(len(self.disease_labels))
                proba[preds[0]] = 1.0
                predictions[name] = proba

        ensemble_proba = np.zeros(len(self.disease_labels))
        total_weight = sum(self.model_weights.values())
        for name, proba in predictions.items():
            weight = self.model_weights.get(name, 1.0)
            ensemble_proba += proba * weight
        ensemble_proba /= total_weight

        top_indices = np.argsort(ensemble_proba)[::-1][:3]
        results = []
        for idx in top_indices:
            if ensemble_proba[idx] > 0.01:
                results.append({
                    "disease": self.disease_labels[idx],
                    "probability": round(float(ensemble_proba[idx]), 4),
                    "matched_symptoms": symptoms_list
                })

        max_prob = results[0]["probability"] if results else 0
        if max_prob >= 0.70:
            confidence = "high"
        elif max_prob >= 0.40:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "predictions": results,
            "confidence": confidence,
            "suggestions": self._get_suggestions(symptoms_list, confidence),
            "disclaimer": "This is not medical advice. Consult a healthcare professional for accurate diagnosis."
        }

    def _get_suggestions(self, symptoms, confidence):
        suggestions = []
        if len(symptoms) < 3:
            suggestions.append("Add more symptoms for better accuracy")
        if confidence == "low":
            suggestions.append("Consider consulting a doctor for proper diagnosis")
            suggestions.append("Try adding more specific symptoms for better results")
        elif confidence == "medium":
            suggestions.append("Results are moderate — adding more specific symptoms may help")
        return suggestions


def train_and_save():
    print("Loading cleaned data...")
    df = pd.read_csv(os.path.join(PROCESSED_DIR, "clean_data.csv"))
    df['symptoms_list'] = df['symptoms_str'].apply(lambda x: [s.strip() for s in x.split(',')])

    mlb = MultiLabelBinarizer()
    X = mlb.fit_transform(df['symptoms_list'])

    le = LabelEncoder()
    y = le.fit_transform(df['disease'])
    disease_labels = list(le.classes_)
    n_samples = len(df)

    print(f"Samples: {n_samples}, Diseases: {len(disease_labels)}, Symptoms: {X.shape[1]}")

    models = {}

    print("\nTraining Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=None, min_samples_split=2,
        min_samples_leaf=1, class_weight='balanced',
        random_state=42, n_jobs=-1
    )
    rf.fit(X, y)
    models["random_forest"] = rf

    try:
        import xgboost as xgb
        print("Training XGBoost...")
        xgb_model = xgb.XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            eval_metric='mlogloss', random_state=42,
            use_label_encoder=False
        )
        xgb_model.fit(X, y)
        models["xgboost"] = xgb_model
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier
        print("Training Gradient Boosting...")
        gb_model = GradientBoostingClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42
        )
        gb_model.fit(X, y)
        models["xgboost"] = gb_model

    print("Training Neural Network...")
    nn = MLPClassifier(
        hidden_layer_sizes=(128, 64, 32), max_iter=1000, random_state=42,
        early_stopping=True, validation_fraction=0.1, alpha=0.001
    )
    nn.fit(X, y)
    models["neural_network"] = nn

    print("Training KNN...")
    knn = KNeighborsClassifier(n_neighbors=3, weights='distance')
    knn.fit(X, y)
    models["knn"] = knn

    # Cross-validation using Leave-One-Out for small dataset
    print("\nEvaluating models (Leave-One-Out CV)...")
    loo = LeaveOneOut()
    cv_results = {}
    for name, model in models.items():
        scores = cross_val_score(model, X, y, cv=loo, scoring='accuracy')
        cv_results[name] = round(float(scores.mean()), 4)
        print(f"  {name}: {cv_results[name]:.4f}")

    # Equal weights for now (all trained on same data)
    weights = {
        "random_forest": 0.35,
        "xgboost": 0.30,
        "neural_network": 0.20,
        "knn": 0.15,
    }

    # Save artifacts
    ensemble_data = {"models": models, "weights": weights}
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    joblib.dump(ensemble_data, MODEL_PATH)
    joblib.dump({"mlb": mlb, "label_encoder": le}, ENCODER_PATH)

    metadata = {
        "loo_cv_accuracy": cv_results,
        "weights": weights,
        "n_diseases": len(disease_labels),
        "n_symptoms": X.shape[1],
        "n_samples": n_samples,
        "diseases": disease_labels,
    }
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n=== Training Complete ===")
    print(f"Models saved to: {ARTIFACTS_DIR}")
    print(f"Vocabulary: {X.shape[1]} symptoms")
    print(f"Diseases: {len(disease_labels)}")
    return metadata


if __name__ == "__main__":
    train_and_save()
