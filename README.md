# 🧠 HealthAI — Intelligent Disease Prediction System

A modern, AI-powered healthcare web application with ensemble ML disease prediction, fuzzy symptom matching, and a dynamic React frontend.

---

## 🚀 Features

### ML Pipeline
- **Ensemble Model**: 4 models (Random Forest, XGBoost, Neural Network, KNN) with soft voting
- **Fuzzy Symptom Matching**: Handles typos, spacing variations, and synonyms using Levenshtein distance
- **Synonym Map**: 120+ symptom aliases mapped to canonical forms
- **Confidence Scoring**: Top 3 predictions with probability percentages and confidence levels
- **Symptom Validation**: Auto-corrects unknown symptoms with suggestions

### Frontend (React + Vite)
- **Dynamic UI**: Animated components, progress indicators, skeleton loading
- **Body System Selection**: Organized symptoms by body region (General, Head, Respiratory, Digestive, Skin, Muscles)
- **Autocomplete Search**: Debounced symptom search with match scoring
- **Multi-step Workflow**: Select → Review → Predict flow
- **Responsive Design**: Mobile-first with hamburger navigation
- **Health Tracker**: BMI calculator with persistent history (localStorage)
- **Disease Encyclopedia**: Browseable catalog with search

### API
- `/predict` — Disease prediction with symptom validation
- `/symptoms/suggest` — Autocomplete symptom search
- `/symptoms/validate` — Validate and normalize symptoms
- `/disease/<name>` — Disease details and care tips
- `/diseases` — List all diseases
- `/health` — Server health check

---

## 📁 Project Structure

```
Healthapp/
├── data/
│   ├── clean_data.py              # Data cleaning & normalization script
│   ├── raw/                       # Original datasets
│   ├── processed/clean_data.csv   # Cleaned training data
│   ├── synonym_map.json           # Symptom synonym mappings
│   └── symptom_vocab.json         # Canonical symptom vocabulary
├── models/
│   ├── train_model.py             # Ensemble model training
│   └── artifacts/                 # Saved model artifacts
│       ├── ensemble.pkl           # Trained models + weights
│       ├── symptom_encoder.pkl    # ML encoder + label encoder
│       └── metadata.json          # Model metrics & info
├── services/
│   └── symptom_processor.py       # Fuzzy matching & normalization
├── frontend/                      # React + Vite application
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── styles/                # Modular CSS with design system
│   │   ├── services/api.js        # API client
│   │   ├── App.jsx                # Main app with routing
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
├── tests/
│   ├── test_symptom_processor.py  # Symptom processing tests
│   └── test_prediction_api.py     # API endpoint tests
├── app.py                         # Flask API server
├── config.py                      # Configuration constants
└── requirements.txt               # Python dependencies
```

---

## ⚙️ How to Run

### 1. Backend (Flask API)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Train the model (if not already done)
python models/train_model.py

# Start the API server
python app.py
```

Server runs at `http://localhost:5000`

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000` with API proxy to backend.

### 3. Run Tests

```bash
PYTHONPATH="." python -m pytest tests/ -v
```

---

## 🧠 Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, CSS3 (design system) |
| Backend | Flask, Flask-CORS |
| ML Models | Random Forest, XGBoost, MLP Neural Network, KNN |
| NLP | RapidFuzz (fuzzy matching), custom synonym map |
| Data | Pandas, NumPy, Scikit-learn |
| Testing | pytest |

---

## 📊 Model Details

- **55 diseases** covered
- **95 unique symptoms** in vocabulary
- **120+ synonym aliases** for fuzzy matching
- Ensemble weighting: RF (35%), XGBoost (30%), NN (20%), KNN (15%)

> **Note**: The current dataset has 1 sample per disease. For production use, collect more training data (multiple patient records per disease with symptom variations) to improve generalization accuracy.

---

## 🛡️ Disclaimer

This is **not medical advice**. Always consult a qualified healthcare professional for diagnosis and treatment.

---

Developed by: Ayush, Bipin, Aditya Singh, Aditya Prabhat, Ashish
