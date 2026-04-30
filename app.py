from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from services.symptom_processor import SymptomProcessor
from models.train_model import PredictionEngine

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

processor = SymptomProcessor()
engine = PredictionEngine()
engine.load_artifacts()

DISEASE_INFO = {
    "Influenza": {
        "description": "A viral infection attacking the respiratory system (nose, throat, lungs). Highly contagious and spreads through droplets.",
        "severity": "moderate",
        "duration": "5-7 days",
        "when_to_see_doctor": "Difficulty breathing, persistent chest pain, confusion, severe weakness, symptoms lasting more than 2 weeks",
        "care_tips": "Rest, stay hydrated, take antiviral medications within 48 hours, use OTC pain relievers for fever"
    },
    "COVID-19": {
        "description": "A respiratory illness caused by the SARS-CoV-2 virus. Can range from mild to severe and is highly contagious.",
        "severity": "high",
        "duration": "7-14 days",
        "when_to_see_doctor": "Difficulty breathing, persistent chest pain, new confusion, bluish lips or face, inability to stay awake",
        "care_tips": "Isolate, rest, stay hydrated, monitor oxygen levels, take prescribed antivirals if available"
    },
    "Diabetes": {
        "description": "A chronic condition affecting how your body processes blood sugar (glucose). Types include Type 1, Type 2, and gestational diabetes.",
        "severity": "high",
        "duration": "chronic",
        "when_to_see_doctor": "Extreme thirst, frequent urination, unexplained weight loss, blurred vision, slow-healing wounds",
        "care_tips": "Monitor blood sugar regularly, maintain a balanced diet, exercise regularly, take prescribed medication"
    },
    "Hypertension": {
        "description": "High blood pressure that can lead to serious health problems including heart disease, stroke, and kidney failure if untreated.",
        "severity": "high",
        "duration": "chronic",
        "when_to_see_doctor": "Blood pressure above 180/120, severe headache, chest pain, nosebleeds, vision changes",
        "care_tips": "Reduce salt intake, exercise regularly, manage stress, limit alcohol, take prescribed medications"
    },
    "Asthma": {
        "description": "A chronic condition causing airways to narrow, swell, and produce extra mucus, making breathing difficult.",
        "severity": "moderate",
        "duration": "chronic",
        "when_to_see_doctor": "Severe attacks not relieved by inhaler, difficulty speaking, lips or fingernails turning blue",
        "care_tips": "Use prescribed inhalers, avoid triggers, maintain an asthma action plan, monitor peak flow"
    },
    "Tuberculosis": {
        "description": "A bacterial infection primarily affecting the lungs, spread through airborne droplets. Can be latent or active.",
        "severity": "high",
        "duration": "6-9 months treatment",
        "when_to_see_doctor": "Cough lasting 3+ weeks, coughing blood, chest pain, night sweats, unexplained weight loss",
        "care_tips": "Complete full course of antibiotics, isolate during contagious phase, attend all follow-ups"
    },
    "Migraine": {
        "description": "A type of headache that can cause severe throbbing pain, often accompanied by nausea, vomiting, and sensitivity to light and sound.",
        "severity": "moderate",
        "duration": "4-72 hours",
        "when_to_see_doctor": "Sudden severe headache ('worst ever'), headache after head injury, headache with fever and stiff neck",
        "care_tips": "Rest in dark quiet room, apply cold compress, stay hydrated, take prescribed migraine medication early"
    },
    "Pneumonia": {
        "description": "An infection that inflames air sacs in one or both lungs, which may fill with fluid or pus.",
        "severity": "high",
        "duration": "1-3 weeks",
        "when_to_see_doctor": "Difficulty breathing, chest pain, persistent fever above 102°F, coughing up pus",
        "care_tips": "Complete antibiotic course, rest, stay hydrated, use fever reducers as needed"
    },
    "Dengue Fever": {
        "description": "A mosquito-borne viral infection causing high fever, severe headache, and pain behind the eyes. Can progress to severe dengue.",
        "severity": "high",
        "duration": "7-10 days",
        "when_to_see_doctor": "Severe abdominal pain, persistent vomiting, bleeding gums, blood in vomit or stool, rapid breathing",
        "care_tips": "Rest, stay hydrated, avoid aspirin (use acetaminophen), prevent mosquito bites during fever"
    },
    "Malaria": {
        "description": "A mosquito-borne parasitic disease causing cycles of fever, chills, and flu-like illness.",
        "severity": "high",
        "duration": "weeks to months if untreated",
        "when_to_see_doctor": "High fever with chills, confusion, seizures, severe weakness, dark urine",
        "care_tips": "Take prescribed antimalarial drugs, use bed nets, prevent mosquito bites, complete full treatment"
    },
    "Anemia": {
        "description": "A condition where you lack enough healthy red blood cells to carry adequate oxygen to your body's tissues.",
        "severity": "moderate",
        "duration": "varies by cause",
        "when_to_see_doctor": "Chest pain, rapid heartbeat, severe fatigue, fainting, shortness of breath at rest",
        "care_tips": "Increase iron-rich foods, take iron supplements as prescribed, treat underlying cause"
    },
    "Arthritis": {
        "description": "Inflammation of one or more joints causing pain and stiffness that can worsen with age.",
        "severity": "moderate",
        "duration": "chronic",
        "when_to_see_doctor": "Severe joint pain, sudden swelling, redness and warmth around joint, inability to use joint",
        "care_tips": "Low-impact exercise, maintain healthy weight, use hot/cold therapy, take prescribed medications"
    },
    "Chickenpox": {
        "description": "A highly contagious viral infection causing an itchy blister-like rash, usually in children.",
        "severity": "low",
        "duration": "10-14 days",
        "when_to_see_doctor": "Rash spreads to eyes, rash becomes very red/warm/swollen, high fever lasting more than 4 days",
        "care_tips": "Do not scratch, use calamine lotion, take oatmeal baths, stay hydrated, isolate until blisters crust"
    },
    "Hepatitis": {
        "description": "Inflammation of the liver, most commonly caused by viral infection (A, B, C). Can also be caused by toxins or autoimmune conditions.",
        "severity": "high",
        "duration": "weeks to chronic",
        "when_to_see_doctor": "Yellowing of skin/eyes, dark urine, severe abdominal pain, confusion, excessive sleepiness",
        "care_tips": "Rest, avoid alcohol, eat balanced meals, follow prescribed antiviral treatment"
    },
    "Typhoid": {
        "description": "A bacterial infection spread through contaminated food and water causing high fever and digestive symptoms.",
        "severity": "high",
        "duration": "3-4 weeks",
        "when_to_see_doctor": "Persistent high fever, severe abdominal pain, blood in stool, confusion",
        "care_tips": "Complete antibiotic course, stay hydrated, eat easily digestible food, maintain hygiene"
    },
    "Measles": {
        "description": "A highly contagious viral infection causing a distinctive red rash, fever, and cough.",
        "severity": "moderate",
        "duration": "7-10 days",
        "when_to_see_doctor": "Difficulty breathing, ear pain, severe headache, confusion, high fever",
        "care_tips": "Rest, stay hydrated, use fever reducers, isolate to prevent spread"
    },
    "Mumps": {
        "description": "A viral infection affecting the salivary glands, causing swollen cheeks and jaw.",
        "severity": "moderate",
        "duration": "2-3 weeks",
        "when_to_see_doctor": "Severe headache, stiff neck, abdominal pain, testicular swelling",
        "care_tips": "Rest, soft foods, cold compress on swollen glands, stay hydrated"
    },
    "GERD": {
        "description": "Chronic acid reflux where stomach acid frequently flows back into the esophagus, irritating the lining.",
        "severity": "moderate",
        "duration": "chronic",
        "when_to_see_doctor": "Difficulty swallowing, chest pain, vomiting blood, black stools, symptoms not improving with OTC meds",
        "care_tips": "Avoid trigger foods, eat smaller meals, don't lie down after eating, elevate head while sleeping"
    },
    "Appendicitis": {
        "description": "Inflammation of the appendix causing severe abdominal pain, typically starting near the navel and moving to the lower right abdomen.",
        "severity": "high",
        "duration": "requires immediate treatment",
        "when_to_see_doctor": "Sudden severe abdominal pain, fever, nausea, vomiting — SEEK EMERGENCY CARE",
        "care_tips": "Do NOT eat or drink, do NOT take laxatives or pain meds — go to ER immediately"
    },
    "Kidney Stones": {
        "description": "Hard deposits of minerals and salts that form inside the kidneys, causing severe pain when passing.",
        "severity": "high",
        "duration": "days to weeks",
        "when_to_see_doctor": "Unbearable pain, fever with chills, blood in urine, nausea and vomiting with pain",
        "care_tips": "Drink plenty of water, take pain medication as prescribed, strain urine to catch stone"
    },
    "Urinary Tract Infection": {
        "description": "An infection in any part of the urinary system (kidneys, bladder, urethra), most commonly the bladder.",
        "severity": "moderate",
        "duration": "3-7 days with treatment",
        "when_to_see_doctor": "Blood in urine, fever, back pain, vomiting, symptoms not improving after 2 days",
        "care_tips": "Drink plenty of water, take prescribed antibiotics, avoid irritants, urinate after intercourse"
    },
    "Breast Cancer": {
        "description": "Cancer that forms in the cells of the breasts. Most common cancer in women worldwide.",
        "severity": "high",
        "duration": "requires treatment",
        "when_to_see_doctor": "New lump in breast, nipple discharge (especially bloody), skin changes, inverted nipple — SEE DOCTOR IMMEDIATELY",
        "care_tips": "Regular self-exams, mammograms as recommended, follow treatment plan from oncologist"
    },
    "Lung Cancer": {
        "description": "Cancer that begins in the lungs, most often in people who smoke but can also occur in non-smokers.",
        "severity": "high",
        "duration": "requires treatment",
        "when_to_see_doctor": "Persistent cough, coughing up blood, chest pain, unexplained weight loss, shortness of breath",
        "care_tips": "Quit smoking, follow oncologist treatment plan, attend all screenings and follow-ups"
    },
    "Skin Cancer": {
        "description": "Abnormal growth of skin cells, most often triggered by sun exposure. Includes melanoma, basal cell, and squamous cell carcinoma.",
        "severity": "high",
        "duration": "requires treatment",
        "when_to_see_doctor": "New mole, changing mole, bleeding sore, any skin growth that looks unusual",
        "care_tips": "Use sunscreen daily, avoid peak sun hours, perform regular skin self-exams, see dermatologist"
    },
}

DEFAULT_INFO = {
    "description": "A medical condition requiring professional evaluation.",
    "severity": "unknown",
    "duration": "varies",
    "when_to_see_doctor": "Consult a healthcare professional for proper diagnosis and treatment.",
    "care_tips": "Rest, stay hydrated, and seek medical attention if symptoms worsen."
}


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "No JSON received. Set Content-Type: application/json"}), 400
        if 'symptoms' not in data:
            return jsonify({"error": "Missing 'symptoms' field. Expected: {'symptoms': ['fever', 'cough']}"}), 400

        validation = processor.validate_and_normalize(data['symptoms'])

        if len(validation["matched"]) < 1:
            return jsonify({
                "error": "No recognized symptoms. Please check your input.",
                "corrections": validation["corrections"]
            }), 400

        result = engine.predict(validation["matched"])
        result["symptom_validation"] = {
            "matched": validation["matched"],
            "unmatched": validation["unmatched"],
            "corrections": validation["corrections"]
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/symptoms/suggest', methods=['GET'])
def suggest_symptoms():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"suggestions": []})
    suggestions = processor.suggest_symptoms(query, limit=10)
    return jsonify({"suggestions": suggestions})


@app.route('/symptoms/validate', methods=['POST'])
def validate_symptoms():
    try:
        data = request.get_json()
        if data is None or 'symptoms' not in data:
            return jsonify({"error": "Missing 'symptoms' field"}), 400
        result = processor.validate_and_normalize(data['symptoms'])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/disease/<name>', methods=['GET'])
def get_disease_info(name):
    disease_name = name.replace('_', ' ').title()
    info = DISEASE_INFO.get(disease_name, DEFAULT_INFO)
    info["name"] = disease_name
    return jsonify(info)


@app.route('/diseases', methods=['GET'])
def list_diseases():
    with open(os.path.join("models", "artifacts", "metadata.json"), 'r') as f:
        meta = json.load(f)
    return jsonify({
        "diseases": meta["diseases"],
        "total": len(meta["diseases"])
    })


@app.route('/health', methods=['GET'])
def health_check():
    with open(os.path.join("models", "artifacts", "metadata.json"), 'r') as f:
        meta = json.load(f)
    return jsonify({
        "status": "healthy",
        "model_accuracy": meta.get("loo_cv_accuracy", meta.get("test_accuracy", 0)),
        "n_diseases": meta["n_diseases"],
        "n_symptoms": meta["n_symptoms"],
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
