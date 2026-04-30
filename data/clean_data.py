import pandas as pd
import json
import re
import os
from collections import defaultdict

DATA_RAW = "disease_symptoms.csv"
DATA_CLEAN = "data/processed/clean_data.csv"
SYNONYM_MAP = "data/synonym_map.json"
VOCAB_PATH = "data/symptom_vocab.json"

SYNONYMS = {
    "fever": ["high temperature", "pyrexia", "high fever", "temperature", "feverish", "hot body"],
    "cough": ["coughing", "dry cough", "wet cough", "persistent cough", "chronic cough"],
    "fatigue": ["tiredness", "weakness", "exhaustion", "lack of energy", "lethargy", "low energy"],
    "headache": ["head pain", "head ache", "pain in head"],
    "nausea": ["feeling sick", "queasiness", "urge to vomit"],
    "vomiting": ["throwing up", "emesis", "vomit"],
    "diarrhea": ["loose stools", "loose motion", "watery stool", "frequent stool"],
    "shortness of breath": ["breathlessness", "difficulty breathing", "trouble breathing", "breathing difficulty", "dyspnea"],
    "chest pain": ["chest discomfort", "pain in chest"],
    "chest tightness": ["tight chest", "chest constriction"],
    "joint pain": ["aching joints", "painful joints", "arthralgia"],
    "muscle pain": ["body ache", "body aches", "myalgia", "muscle ache", "pain in muscles"],
    "sore throat": ["throat pain", "painful throat", "scratchy throat"],
    "runny nose": ["nasal discharge", "runny nasal", "dripping nose"],
    "night sweats": ["sweating at night", "nighttime sweating"],
    "weight loss": ["losing weight", "unexplained weight loss"],
    "loss of appetite": ["no appetite", "reduced appetite", "poor appetite", "loss of hunger"],
    "blurred vision": ["blurry vision", "vision blurring", "unclear vision"],
    "abdominal pain": ["stomach pain", "belly pain", "pain in abdomen", "stomach ache"],
    "swelling": ["inflammation", "swollen"],
    "rash": ["skin rash", "red rash", "itchy rash"],
    "dizziness": ["lightheadedness", "feeling dizzy", "vertigo"],
    "pale skin": ["paleness", "pale complexion"],
    "cold hands and feet": ["cold extremities"],
    "loss of taste or smell": ["loss of taste", "loss of smell", "anosmia", "ageusia"],
    "stiffness": ["stiff joints", "rigidity"],
    "reduced range of motion": ["limited movement", "restricted movement"],
    "sensitivity to light": ["light sensitivity", "photophobia"],
    "sensitivity to sound": ["sound sensitivity", "phonophobia"],
    "swollen lymph nodes": ["swollen glands", "enlarged lymph nodes"],
    "red eyes": ["eye redness", "bloodshot eyes"],
    "difficulty swallowing": ["trouble swallowing", "swallowing difficulty", "dysphagia"],
    "frequent urination": ["urinating often", "increased urination"],
    "increased thirst": ["excessive thirst", "polydipsia"],
    "bloating": ["abdominal bloating", "stomach bloating", "swollen stomach"],
    "heartburn": ["acid reflux", "burning chest"],
    "stomach pain": ["abdominal pain", "belly ache"],
    "wheezing": ["wheezing sound", "whistling breath"],
    "difficulty breathing": ["trouble breathing", "breathing difficulty"],
    "pain behind eyes": ["eye pain", "retro-orbital pain"],
    "burning stomach pain": ["burning stomach ache", "burning sensation in stomach"],
    "burning urination": ["painful urination", "burning while urinating"],
    "blood in urine": ["bloody urine", "hematuria"],
    "blood in stool": ["bloody stool", "rectal bleeding"],
    "nipple discharge": ["discharge from nipple"],
    "lump in breast": ["breast lump", "breast mass"],
    "skin changes": ["changes in skin"],
    "mole changes": ["changing moles", "changing mole"],
    "skin lesions": ["lesions on skin"],
    "easy bruising": ["bruises easily", "bruising easily"],
    "frequent infections": ["recurring infections", "recurrent infections"],
    "memory loss": ["forgetfulness", "poor memory"],
    "confusion": ["disorientation", "mental confusion"],
    "difficulty communicating": ["trouble speaking", "speech difficulty"],
    "mood changes": ["mood swings", "changes in mood"],
    "kidney problems": ["kidney issues"],
    "numbness": ["tingling", "loss of sensation"],
    "tremors": ["shaking", "trembling"],
    "slow movement": ["slowed movement", "bradykinesia"],
    "loss of balance": ["balance problems", "unsteady"],
    "lockjaw": ["jaw stiffness", "jaw lock"],
    "muscle stiffness": ["stiff muscles"],
    "anxiety": ["nervousness", "feeling anxious"],
    "hydrophobia": ["fear of water"],
    "excess salivation": ["drooling", "excessive saliva"],
    "paralysis": ["loss of movement", "unable to move"],
    "severe headache": ["bad headache", "intense headache"],
    "severe abdominal pain": ["intense stomach pain", "severe belly pain"],
    "severe diarrhea": ["severe loose motion"],
    "severe fever": ["very high fever"],
    "mild fever": ["low grade fever", "low-grade fever"],
    "high fever": ["very high temperature"],
    "bleeding": ["hemorrhage"],
    "organ failure": ["organ dysfunction"],
    "leg cramps": ["muscle cramps in legs"],
    "dehydration": ["dehydrated"],
    "chills": ["chilly", "feeling cold"],
    "sweating": ["perspiration", "excessive sweating"],
    "itching": ["itchy", "pruritus"],
    "loss of taste": ["cannot taste"],
    "loss of smell": ["cannot smell"],
    "stiff neck": ["neck stiffness"],
    "sore throat": ["throat pain"],
    "coughing fits": ["coughing spells", "severe coughing"],
    "swollen tonsils": ["enlarged tonsils"],
    "jaundice": ["yellowing of skin", "yellow skin", "yellow eyes"],
    "dark urine": ["dark colored urine"],
    "bloody diarrhea": ["blood in diarrhea"],
    "itchy rash": ["itching rash"],
    "loss of appetite": ["no appetite"],
    "increased thirst": ["excessive thirst"],
    "frequent urination": ["urinating frequently"],
    "unexplained weight loss": ["weight loss without trying"],
}

def normalize_symptom(s):
    s = s.strip().lower()
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'[,;:.!]+$', '', s)
    return s

def build_reverse_synonym_map():
    reverse_map = {}
    for canonical, aliases in SYNONYMS.items():
        for alias in aliases:
            reverse_map[alias.lower()] = canonical
    return reverse_map

def clean_symptom_text(text):
    parts = [p.strip() for p in text.split(',')]
    cleaned = []
    for p in parts:
        n = normalize_symptom(p)
        if n:
            cleaned.append(n)
    return cleaned

def main():
    df = pd.read_csv(DATA_RAW)
    df['symptoms_list'] = df['symptoms'].apply(clean_symptom_text)
    df['symptoms_str'] = df['symptoms_list'].apply(lambda x: ", ".join(sorted(x)))
    df = df.drop_duplicates(subset=['disease', 'symptoms_str'])
    print(f"Rows before dedup: {len(df)}")

    reverse_syn = build_reverse_synonym_map()

    all_symptoms = set()
    normalized_rows = []
    for idx, row in df.iterrows():
        normalized = []
        for s in row['symptoms_list']:
            canonical = reverse_syn.get(s, s)
            normalized.append(canonical)
            all_symptoms.add(canonical)
        normalized_rows.append(sorted(list(set(normalized))))

    df['symptoms_list'] = normalized_rows
    df['symptoms_str'] = df['symptoms_list'].apply(lambda x: ", ".join(x))
    df = df.drop_duplicates(subset=['disease', 'symptoms_str'])
    print(f"Rows after synonym normalization + dedup: {len(df)}")

    os.makedirs("data/processed", exist_ok=True)
    df[['disease', 'symptoms_str']].to_csv(DATA_CLEAN, index=False)

    vocab = sorted(list(all_symptoms))
    with open(VOCAB_PATH, 'w') as f:
        json.dump({"vocabulary": vocab, "size": len(vocab)}, f, indent=2)
    print(f"Symptom vocabulary size: {len(vocab)}")

    with open(SYNONYM_MAP, 'w') as f:
        json.dump({"canonical_to_aliases": SYNONYMS, "reverse_map": reverse_syn}, f, indent=2)

    disease_counts = df['disease'].value_counts()
    print(f"\nDisease distribution:")
    for d, c in disease_counts.items():
        print(f"  {d}: {c}")
    print(f"\nTotal unique diseases: {df['disease'].nunique()}")
    print(f"Total rows: {len(df)}")
    print(f"Files saved: {DATA_CLEAN}, {VOCAB_PATH}, {SYNONYM_MAP}")

if __name__ == "__main__":
    main()
