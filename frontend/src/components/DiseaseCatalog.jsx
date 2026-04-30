import { useState, useEffect, useCallback } from 'react';
import { listDiseases, getDiseaseInfo } from '../services/api';
import '../styles/DiseaseCatalog.css';

const DISEASE_DATA = {
  "Influenza": { description: "A highly contagious viral infection attacking the respiratory system (nose, throat, lungs). Spreads through droplets from coughs and sneezes.", symptoms: ["Fever", "Cough", "Sore Throat", "Runny Nose", "Body Aches", "Fatigue"], severity: "moderate", duration: "5-7 days", treatment: "Rest, stay hydrated, antiviral medications within 48 hours, OTC pain relievers for fever", warning: "Difficulty breathing, persistent chest pain, confusion, severe weakness, symptoms lasting more than 2 weeks" },
  "COVID-19": { description: "A respiratory illness caused by the SARS-CoV-2 virus. Can range from mild to severe and is highly contagious.", symptoms: ["Fever", "Cough", "Shortness of Breath", "Loss of Taste or Smell", "Fatigue"], severity: "high", duration: "7-14 days", treatment: "Isolate, rest, stay hydrated, monitor oxygen levels, take prescribed antivirals if available", warning: "Difficulty breathing, persistent chest pain, new confusion, bluish lips or face, inability to stay awake" },
  "Diabetes": { description: "A chronic condition affecting how your body processes blood sugar (glucose). Types include Type 1, Type 2, and gestational diabetes.", symptoms: ["Increased Thirst", "Frequent Urination", "Unexplained Weight Loss", "Fatigue", "Blurred Vision"], severity: "high", duration: "chronic", treatment: "Monitor blood sugar regularly, maintain a balanced diet, exercise regularly, take prescribed medication", warning: "Extreme thirst, frequent urination, unexplained weight loss, blurred vision, slow-healing wounds" },
  "Hypertension": { description: "High blood pressure that can lead to serious health problems including heart disease, stroke, and kidney failure if untreated.", symptoms: ["Headache", "Dizziness", "Nosebleeds", "Blurred Vision", "Shortness of Breath"], severity: "high", duration: "chronic", treatment: "Reduce salt intake, exercise regularly, manage stress, limit alcohol, take prescribed medications", warning: "Blood pressure above 180/120, severe headache, chest pain, nosebleeds, vision changes" },
  "Asthma": { description: "A chronic condition causing airways to narrow, swell, and produce extra mucus, making breathing difficult.", symptoms: ["Wheezing", "Shortness of Breath", "Chest Tightness", "Coughing"], severity: "moderate", duration: "chronic", treatment: "Use prescribed inhalers, avoid triggers, maintain an asthma action plan, monitor peak flow", warning: "Severe attacks not relieved by inhaler, difficulty speaking, lips or fingernails turning blue" },
  "Tuberculosis": { description: "A bacterial infection primarily affecting the lungs, spread through airborne droplets. Can be latent or active.", symptoms: ["Chronic Cough", "Fever", "Night Sweats", "Weight Loss", "Fatigue"], severity: "high", duration: "6-9 months treatment", treatment: "Complete full course of antibiotics, isolate during contagious phase, attend all follow-ups", warning: "Cough lasting 3+ weeks, coughing blood, chest pain, night sweats, unexplained weight loss" },
  "Migraine": { description: "A type of headache that can cause severe throbbing pain, often accompanied by nausea, vomiting, and sensitivity to light and sound.", symptoms: ["Severe Headache", "Nausea", "Sensitivity to Light", "Sensitivity to Sound"], severity: "moderate", duration: "4-72 hours", treatment: "Rest in dark quiet room, apply cold compress, stay hydrated, take prescribed migraine medication early", warning: "Sudden severe headache ('worst ever'), headache after head injury, headache with fever and stiff neck" },
  "Pneumonia": { description: "An infection that inflames air sacs in one or both lungs, which may fill with fluid or pus.", symptoms: ["Cough", "Fever", "Chest Pain", "Difficulty Breathing", "Fatigue"], severity: "high", duration: "1-3 weeks", treatment: "Complete antibiotic course, rest, stay hydrated, use fever reducers as needed", warning: "Difficulty breathing, chest pain, persistent fever above 102°F, coughing up pus" },
  "Dengue Fever": { description: "A mosquito-borne viral infection causing high fever, severe headache, and pain behind the eyes. Can progress to severe dengue.", symptoms: ["High Fever", "Severe Headache", "Pain Behind Eyes", "Joint Pain", "Rash"], severity: "high", duration: "7-10 days", treatment: "Rest, stay hydrated, avoid aspirin (use acetaminophen), prevent mosquito bites during fever", warning: "Severe abdominal pain, persistent vomiting, bleeding gums, blood in vomit or stool, rapid breathing" },
  "Malaria": { description: "A mosquito-borne parasitic disease causing cycles of fever, chills, and flu-like illness.", symptoms: ["Fever", "Chills", "Sweating", "Muscle Pain", "Nausea"], severity: "high", duration: "weeks to months if untreated", treatment: "Take prescribed antimalarial drugs, use bed nets, prevent mosquito bites, complete full treatment", warning: "High fever with chills, confusion, seizures, severe weakness, dark urine" },
  "Anemia": { description: "A condition where you lack enough healthy red blood cells to carry adequate oxygen to your body's tissues.", symptoms: ["Fatigue", "Pale Skin", "Shortness of Breath", "Dizziness", "Cold Hands and Feet"], severity: "moderate", duration: "varies by cause", treatment: "Increase iron-rich foods, take iron supplements as prescribed, treat underlying cause", warning: "Chest pain, rapid heartbeat, severe fatigue, fainting, shortness of breath at rest" },
  "Arthritis": { description: "Inflammation of one or more joints causing pain and stiffness that can worsen with age.", symptoms: ["Joint Pain", "Swelling", "Stiffness", "Reduced Range of Motion"], severity: "moderate", duration: "chronic", treatment: "Low-impact exercise, maintain healthy weight, use hot/cold therapy, take prescribed medications", warning: "Severe joint pain, sudden swelling, redness and warmth around joint, inability to use joint" },
  "Chickenpox": { description: "A highly contagious viral infection causing an itchy blister-like rash, usually in children.", symptoms: ["Itchy Rash", "Fever", "Fatigue", "Loss of Appetite"], severity: "low", duration: "10-14 days", treatment: "Do not scratch, use calamine lotion, take oatmeal baths, stay hydrated, isolate until blisters crust", warning: "Rash spreads to eyes, rash becomes very red/warm/swollen, high fever lasting more than 4 days" },
  "Hepatitis": { description: "Inflammation of the liver, most commonly caused by viral infection (A, B, C). Can also be caused by toxins or autoimmune conditions.", symptoms: ["Jaundice", "Fatigue", "Nausea", "Abdominal Pain", "Dark Urine"], severity: "high", duration: "weeks to chronic", treatment: "Rest, avoid alcohol, eat balanced meals, follow prescribed antiviral treatment", warning: "Yellowing of skin/eyes, dark urine, severe abdominal pain, confusion, excessive sleepiness" },
  "Typhoid": { description: "A bacterial infection spread through contaminated food and water causing high fever and digestive symptoms.", symptoms: ["High Fever", "Weakness", "Abdominal Pain", "Loss of Appetite", "Diarrhea"], severity: "high", duration: "3-4 weeks", treatment: "Complete antibiotic course, stay hydrated, eat easily digestible food, maintain hygiene", warning: "Persistent high fever, severe abdominal pain, blood in stool, confusion" },
  "Measles": { description: "A highly contagious viral infection causing a distinctive red rash, fever, and cough.", symptoms: ["Fever", "Rash", "Cough", "Runny Nose", "Red Eyes"], severity: "moderate", duration: "7-10 days", treatment: "Rest, stay hydrated, use fever reducers, isolate to prevent spread", warning: "Difficulty breathing, ear pain, severe headache, confusion, high fever" },
  "Mumps": { description: "A viral infection affecting the salivary glands, causing swollen cheeks and jaw.", symptoms: ["Swollen Salivary Glands", "Fever", "Headache", "Muscle Aches", "Fatigue"], severity: "moderate", duration: "2-3 weeks", treatment: "Rest, soft foods, cold compress on swollen glands, stay hydrated", warning: "Severe headache, stiff neck, abdominal pain, testicular swelling" },
  "Rubella": { description: "A viral infection also known as German measles, usually mild but dangerous during pregnancy.", symptoms: ["Mild Fever", "Rash", "Swollen Lymph Nodes", "Red Eyes", "Joint Pain"], severity: "moderate", duration: "5-7 days", treatment: "Rest, stay hydrated, use fever reducers, isolate to prevent spread", warning: "If pregnant and exposed, seek immediate medical care" },
  "Ebola": { description: "A severe, often fatal viral hemorrhagic fever spread through direct contact with infected bodily fluids.", symptoms: ["Severe Fever", "Vomiting", "Diarrhea", "Bleeding", "Muscle Pain"], severity: "high", duration: "2-21 days incubation", treatment: "Immediate hospitalization, supportive care, IV fluids, experimental antivirals", warning: "Seek emergency care immediately if symptoms appear after exposure" },
  "Zika Virus": { description: "A mosquito-borne viral infection causing mild symptoms but dangerous for pregnant women and fetal development.", symptoms: ["Mild Fever", "Rash", "Joint Pain", "Red Eyes", "Headache"], severity: "moderate", duration: "2-7 days", treatment: "Rest, stay hydrated, use acetaminophen for fever, avoid mosquito bites", warning: "Pregnant women should seek immediate care due to birth defect risk" },
  "Cholera": { description: "A bacterial infection causing severe watery diarrhea and dehydration, spread through contaminated water.", symptoms: ["Severe Diarrhea", "Dehydration", "Vomiting", "Leg Cramps"], severity: "high", duration: "hours to days", treatment: "Oral rehydration solution, IV fluids for severe cases, antibiotics, zinc supplements", warning: "Severe dehydration, sunken eyes, dry mouth, rapid heart rate, inability to drink" },
  "Leptospirosis": { description: "A bacterial infection spread through water contaminated by animal urine, affecting both humans and animals.", symptoms: ["High Fever", "Headache", "Chills", "Muscle Aches", "Jaundice"], severity: "high", duration: "few days to weeks", treatment: "Antibiotics (doxycycline or penicillin), supportive care, hospitalization for severe cases", warning: "Jaundice, kidney failure, respiratory distress, meningitis symptoms" },
  "Tetanus": { description: "A serious bacterial infection affecting the nervous system, causing painful muscle contractions, especially of the jaw and neck.", symptoms: ["Muscle Stiffness", "Lockjaw", "Difficulty Swallowing", "Fever", "Sweating"], severity: "high", duration: "weeks to months", treatment: "Tetanus immune globulin, antibiotics, muscle relaxants, wound care, vaccination", warning: "Severe muscle spasms, breathing difficulty, heart rate abnormalities" },
  "Rabies": { description: "A fatal viral infection transmitted through animal bites, attacking the central nervous system.", symptoms: ["Fever", "Anxiety", "Hydrophobia", "Excess Salivation", "Paralysis"], severity: "high", duration: "days to weeks after symptoms appear", treatment: "Post-exposure prophylaxis (vaccine + immune globulin) immediately after bite", warning: "Once symptoms appear, rabies is almost always fatal — seek care immediately after animal bite" },
  "Yellow Fever": { description: "A viral hemorrhagic disease transmitted by infected mosquitoes, endemic in tropical regions of Africa and South America.", symptoms: ["High Fever", "Jaundice", "Bleeding", "Organ Failure", "Headache"], severity: "high", duration: "3-6 days acute phase", treatment: "Supportive care, no specific antiviral, vaccination for prevention", warning: "Jaundice, bleeding, shock, organ failure — seek emergency care" },
  "Plague": { description: "A bacterial infection caused by Yersinia pestis, transmitted by fleas. Can manifest as bubonic, septicemic, or pneumonic plague.", symptoms: ["Swollen Lymph Nodes", "Fever", "Chills", "Weakness", "Cough"], severity: "high", duration: "1-7 days incubation", treatment: "Antibiotics (streptomycin, doxycycline), isolation for pneumonic plague", warning: "Difficulty breathing, coughing blood, blackened skin tissue" },
  "Polio": { description: "A highly infectious viral disease that mainly affects young children and can cause irreversible paralysis.", symptoms: ["Muscle Weakness", "Paralysis", "Fever", "Sore Throat", "Stiff Neck"], severity: "high", duration: "acute phase: 1-2 weeks", treatment: "No cure — supportive treatment, pain management, physical therapy, vaccination prevents it", warning: "Sudden paralysis, breathing difficulty, swallowing problems" },
  "Whooping Cough": { description: "A highly contagious respiratory infection caused by Bordetella pertussis, characterized by severe coughing fits.", symptoms: ["Severe Coughing Fits", "Vomiting", "Fatigue", "Difficulty Breathing"], severity: "moderate", duration: "6-10 weeks", treatment: "Antibiotics (azithromycin), rest, hydration, humidified air, vaccination prevents it", warning: "Coughing fits causing inability to breathe, blue lips, apnea in infants" },
  "Scarlet Fever": { description: "A bacterial illness caused by Group A Streptococcus, developing in some people who have strep throat.", symptoms: ["Sore Throat", "Red Rash", "Fever", "Swollen Tonsils", "Headache"], severity: "moderate", duration: "1-2 weeks with treatment", treatment: "Antibiotics (penicillin or amoxicillin), rest, fluids, fever reducers", warning: "High fever with rash, difficulty swallowing, dehydration" },
  "HIV/AIDS": { description: "A viral infection that attacks the immune system, eventually leading to AIDS if untreated. Transmitted through blood, sexual contact, and mother-to-child.", symptoms: ["Chronic Fatigue", "Weight Loss", "Frequent Infections", "Night Sweats"], severity: "high", duration: "chronic/lifelong", treatment: "Antiretroviral therapy (ART), regular monitoring, prevent opportunistic infections", warning: "Severe weight loss, persistent fever, opportunistic infections, neurological symptoms" },
  "Lupus": { description: "A chronic autoimmune disease where the immune system attacks healthy tissues, affecting joints, skin, kidneys, and other organs.", symptoms: ["Fatigue", "Joint Pain", "Rash", "Fever", "Kidney Problems"], severity: "high", duration: "chronic/lifelong", treatment: "Immunosuppressants, corticosteroids, antimalarials, NSAIDs, avoid sun exposure", warning: "Kidney failure, seizures, severe chest pain, blood clots" },
  "Multiple Sclerosis": { description: "A chronic autoimmune disease where the immune system attacks the protective covering of nerves (myelin), disrupting communication between brain and body.", symptoms: ["Muscle Weakness", "Vision Problems", "Fatigue", "Numbness", "Dizziness"], severity: "high", duration: "chronic/lifelong", treatment: "Disease-modifying therapies, corticosteroids for flares, physical therapy, symptom management", warning: "Sudden vision loss, severe weakness, difficulty walking, bowel/bladder dysfunction" },
  "Parkinson's Disease": { description: "A progressive nervous system disorder affecting movement, caused by loss of dopamine-producing brain cells.", symptoms: ["Tremors", "Slow Movement", "Stiffness", "Loss of Balance"], severity: "high", duration: "chronic/progressive", treatment: "Levodopa/carbidopa, dopamine agonists, physical therapy, deep brain stimulation in advanced cases", warning: "Severe freezing episodes, falls, difficulty swallowing, cognitive decline" },
  "Alzheimer's Disease": { description: "A progressive brain disorder that slowly destroys memory and thinking skills, eventually affecting the ability to carry out simple tasks.", symptoms: ["Memory Loss", "Confusion", "Difficulty Communicating", "Mood Changes"], severity: "high", duration: "chronic/progressive", treatment: "Cholinesterase inhibitors, memantine, cognitive stimulation, supportive care", warning: "Wandering, inability to recognize family, severe confusion, inability to perform daily activities" },
  "Celiac Disease": { description: "An autoimmune disorder where ingestion of gluten leads to damage of the small intestine.", symptoms: ["Diarrhea", "Bloating", "Fatigue", "Weight Loss", "Skin Rash"], severity: "moderate", duration: "chronic/lifelong", treatment: "Strict gluten-free diet, nutritional supplements, monitor for complications", warning: "Severe malnutrition, anemia, osteoporosis, intestinal lymphoma risk" },
  "Crohn's Disease": { description: "A type of inflammatory bowel disease (IBD) causing chronic inflammation of the digestive tract.", symptoms: ["Abdominal Pain", "Diarrhea", "Weight Loss", "Fatigue", "Fever"], severity: "moderate", duration: "chronic/lifelong", treatment: "Anti-inflammatory drugs, immunosuppressants, biologics, surgery in severe cases", warning: "Severe abdominal pain, persistent bloody diarrhea, high fever, bowel obstruction" },
  "Ulcerative Colitis": { description: "A chronic inflammatory bowel disease causing inflammation and ulcers in the digestive tract, limited to the colon and rectum.", symptoms: ["Bloody Diarrhea", "Abdominal Pain", "Weight Loss", "Fatigue"], severity: "moderate", duration: "chronic/lifelong", treatment: "Anti-inflammatory drugs, immunosuppressants, biologics, surgery (colectomy) in severe cases", warning: "Severe bleeding, high fever, toxic megacolon, dehydration" },
  "Gastritis": { description: "Inflammation of the stomach lining, causing pain, nausea, and indigestion.", symptoms: ["Stomach Pain", "Nausea", "Vomiting", "Bloating", "Loss of Appetite"], severity: "low", duration: "days to weeks", treatment: "Antacids, acid reducers (PPIs), avoid irritants (alcohol, NSAIDs), eat smaller meals", warning: "Vomiting blood, black tarry stools, severe persistent pain" },
  "Peptic Ulcer": { description: "Open sores that develop on the lining of the stomach, small intestine, or esophagus.", symptoms: ["Burning Stomach Pain", "Nausea", "Bloating", "Weight Loss"], severity: "moderate", duration: "weeks to months with treatment", treatment: "Antibiotics (if H. pylori), acid-reducing medications (PPIs), avoid NSAIDs and alcohol", warning: "Severe sharp pain, vomiting blood, black stools, sudden worsening" },
  "GERD": { description: "Chronic acid reflux where stomach acid frequently flows back into the esophagus, irritating the lining.", symptoms: ["Heartburn", "Chest Pain", "Difficulty Swallowing", "Chronic Cough"], severity: "moderate", duration: "chronic", treatment: "Avoid trigger foods, eat smaller meals, don't lie down after eating, elevate head while sleeping, PPIs", warning: "Difficulty swallowing, chest pain, vomiting blood, black stools, symptoms not improving with OTC meds" },
  "Appendicitis": { description: "Inflammation of the appendix causing severe abdominal pain, typically starting near the navel and moving to the lower right abdomen.", symptoms: ["Severe Abdominal Pain", "Fever", "Nausea", "Vomiting", "Swelling"], severity: "high", duration: "requires immediate treatment", treatment: "Do NOT eat or drink, do NOT take laxatives or pain meds — go to ER immediately for appendectomy", warning: "Sudden severe abdominal pain, fever, nausea, vomiting — SEEK EMERGENCY CARE" },
  "Pancreatitis": { description: "Inflammation of the pancreas causing severe abdominal pain and digestive problems.", symptoms: ["Severe Abdominal Pain", "Nausea", "Vomiting", "Fever", "Weight Loss"], severity: "high", duration: "days to weeks", treatment: "Hospitalization, IV fluids, pain management, fasting initially, treat underlying cause", warning: "Severe unrelenting abdominal pain, fever, rapid pulse, difficulty breathing" },
  "Hepatitis B": { description: "A viral liver infection that can cause both acute and chronic disease, transmitted through blood and bodily fluids.", symptoms: ["Fatigue", "Jaundice", "Nausea", "Dark Urine", "Abdominal Pain"], severity: "high", duration: "acute: weeks; chronic: lifelong", treatment: "Antiviral medications for chronic cases, vaccination prevents it, avoid alcohol, regular liver monitoring", warning: "Jaundice, severe abdominal pain, confusion, bleeding" },
  "Kidney Stones": { description: "Hard deposits of minerals and salts that form inside the kidneys, causing severe pain when passing.", symptoms: ["Severe Pain", "Blood in Urine", "Frequent Urination", "Nausea"], severity: "high", duration: "days to weeks", treatment: "Drink plenty of water, take pain medication as prescribed, strain urine to catch stone, lithotripsy if large", warning: "Unbearable pain, fever with chills, blood in urine, nausea and vomiting with pain" },
  "Urinary Tract Infection": { description: "An infection in any part of the urinary system (kidneys, bladder, urethra), most commonly the bladder.", symptoms: ["Burning Urination", "Frequent Urination", "Fever", "Back Pain"], severity: "moderate", duration: "3-7 days with treatment", treatment: "Drink plenty of water, take prescribed antibiotics, avoid irritants, urinate after intercourse", warning: "Blood in urine, fever, back pain, vomiting, symptoms not improving after 2 days" },
  "Prostate Cancer": { description: "Cancer that occurs in the prostate gland, one of the most common cancers in men.", symptoms: ["Difficulty Urinating", "Blood in Urine", "Pelvic Pain", "Weight Loss"], severity: "high", duration: "requires treatment", treatment: "Surgery, radiation therapy, hormone therapy, chemotherapy depending on stage", warning: "Blood in urine, inability to urinate, severe pelvic/back pain" },
  "Ovarian Cancer": { description: "Cancer that begins in the ovaries, often detected late because symptoms are vague.", symptoms: ["Abdominal Bloating", "Pelvic Pain", "Weight Loss", "Fatigue"], severity: "high", duration: "requires treatment", treatment: "Surgery to remove tumor, chemotherapy, targeted therapy", warning: "Persistent bloating, pelvic/abdominal pain, difficulty eating, feeling full quickly" },
  "Breast Cancer": { description: "Cancer that forms in the cells of the breasts. Most common cancer in women worldwide.", symptoms: ["Lump in Breast", "Nipple Discharge", "Swelling", "Skin Changes"], severity: "high", duration: "requires treatment", treatment: "Surgery, radiation, chemotherapy, hormone therapy, targeted therapy", warning: "New lump in breast, nipple discharge (especially bloody), skin changes, inverted nipple" },
  "Lung Cancer": { description: "Cancer that begins in the lungs, most often in people who smoke but can also occur in non-smokers.", symptoms: ["Persistent Cough", "Chest Pain", "Weight Loss", "Shortness of Breath"], severity: "high", duration: "requires treatment", treatment: "Surgery, chemotherapy, radiation, targeted therapy, immunotherapy depending on type and stage", warning: "Persistent cough, coughing up blood, chest pain, unexplained weight loss" },
  "Liver Cancer": { description: "Cancer that begins in the cells of the liver. Often develops in people with chronic liver disease.", symptoms: ["Abdominal Pain", "Jaundice", "Nausea", "Unexplained Weight Loss"], severity: "high", duration: "requires treatment", treatment: "Surgery, liver transplant, ablation, chemotherapy, targeted therapy", warning: "Jaundice, severe abdominal pain, swelling, confusion, dark urine" },
  "Colon Cancer": { description: "Cancer that begins in the colon (large intestine) or rectum. Regular screening can detect it early.", symptoms: ["Blood in Stool", "Abdominal Pain", "Weight Loss", "Fatigue"], severity: "high", duration: "requires treatment", treatment: "Surgery, chemotherapy, radiation, targeted therapy depending on stage", warning: "Blood in stool, persistent changes in bowel habits, unexplained weight loss" },
  "Skin Cancer": { description: "Abnormal growth of skin cells, most often triggered by sun exposure. Includes melanoma, basal cell, and squamous cell carcinoma.", symptoms: ["Mole Changes", "Skin Lesions", "Itching", "Bleeding", "Red Patches"], severity: "high", duration: "requires treatment", treatment: "Surgical excision, Mohs surgery, radiation, topical treatments, immunotherapy", warning: "New mole, changing mole, bleeding sore, any skin growth that looks unusual" },
  "Leukemia": { description: "Cancer of the blood-forming tissues, including bone marrow, causing overproduction of abnormal white blood cells.", symptoms: ["Frequent Infections", "Fatigue", "Unexplained Weight Loss", "Easy Bruising"], severity: "high", duration: "requires treatment", treatment: "Chemotherapy, radiation, targeted therapy, stem cell transplant, immunotherapy", warning: "Frequent infections, unusual bleeding, severe fatigue, bone pain" },
  "Lymphoma": { description: "Cancer of the lymphatic system, affecting lymphocytes (white blood cells). Includes Hodgkin's and non-Hodgkin's types.", symptoms: ["Swollen Lymph Nodes", "Night Sweats", "Fatigue", "Unexplained Fever"], severity: "high", duration: "requires treatment", treatment: "Chemotherapy, radiation, immunotherapy, targeted therapy, stem cell transplant", warning: "Persistent swollen lymph nodes, drenching night sweats, unexplained weight loss" },
  "Brain Tumor": { description: "Abnormal growth of cells within the brain. Can be benign or malignant.", symptoms: ["Headache", "Nausea", "Vision Problems", "Memory Loss", "Dizziness"], severity: "high", duration: "requires treatment", treatment: "Surgery, radiation, chemotherapy, targeted therapy depending on type and location", warning: "Severe new headaches, seizures, sudden vision changes, difficulty speaking, personality changes" },
};

export function DiseaseCatalog() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedDisease, setExpandedDisease] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    listDiseases()
      .then(data => setDiseases(data.diseases))
      .catch(() => setDiseases([]))
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = useCallback(async (disease) => {
    if (expandedDisease === disease) {
      setExpandedDisease(null);
      return;
    }
    setExpandedDisease(disease);
    if (!DISEASE_DATA[disease]) {
      try {
        const info = await getDiseaseInfo(disease);
        setDiseases(prev => [...prev]);
      } catch { /* use fallback */ }
    }
  }, [expandedDisease]);

  const filtered = diseases.filter(d => {
    const matchesSearch = d.toLowerCase().includes(search.toLowerCase());
    const data = DISEASE_DATA[d];
    const matchesSeverity = filterSeverity === 'all' || (data && data.severity === filterSeverity);
    return matchesSearch && matchesSeverity;
  });

  const severityColors = { low: '#22c55e', moderate: '#f59e0b', high: '#dc2626' };

  return (
    <div className="disease-catalog">
      <div className="catalog-header animate-fade-in-up">
        <h1>📖 Disease Encyclopedia</h1>
        <p>Complete details on {diseases.length} diseases — symptoms, treatments, and warning signs</p>
      </div>

      <div className="catalog-controls animate-fade-in-up stagger-1">
        <div className="catalog-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search diseases..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
        </div>
        <div className="severity-filters">
          {['all', 'high', 'moderate', 'low'].map(sev => (
            <button
              key={sev}
              className={`severity-btn ${filterSeverity === sev ? 'active' : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              {sev !== 'all' && <span className="severity-dot" style={{ background: severityColors[sev] }} />}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="catalog-card skeleton" />)}
        </div>
      ) : (
        <>
          <p className="count-badge animate-fade-in-up stagger-2">{filtered.length} disease{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="catalog-grid detailed">
            {filtered.map((disease, i) => {
              const data = DISEASE_DATA[disease];
              const isExpanded = expandedDisease === disease;
              const severity = data?.severity || 'unknown';

              return (
                <div
                  key={disease}
                  className={`catalog-card detail-card ${isExpanded ? 'expanded' : ''} animate-fade-in-up`}
                  style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s` }}
                  onClick={() => handleExpand(disease)}
                >
                  <div className="card-header">
                    <div className="card-icon" style={{
                      background: `${severityColors[severity] || '#94a3b8'}15`,
                      color: severityColors[severity] || '#94a3b8',
                    }}>
                      {disease.charAt(0)}
                    </div>
                    <div className="card-title-section">
                      <h3>{disease}</h3>
                      {data && (
                        <span className="severity-badge-inline" style={{
                          background: `${severityColors[severity]}15`,
                          color: severityColors[severity],
                        }}>
                          {severity}
                        </span>
                      )}
                    </div>
                    <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                  </div>

                  {isExpanded && data && (
                    <div className="card-details animate-fade-in-down">
                      <p className="disease-desc">{data.description}</p>

                      <div className="detail-section">
                        <h4>🩺 Symptoms</h4>
                        <div className="symptom-tags">
                          {data.symptoms.map(s => <span key={s} className="symptom-tag">{s}</span>)}
                        </div>
                      </div>

                      <div className="detail-row">
                        <div className="detail-item">
                          <span className="detail-label">⏱️ Duration</span>
                          <span className="detail-value">{data.duration}</span>
                        </div>
                      </div>

                      <div className="detail-section treatment">
                        <h4>💊 Treatment</h4>
                        <p>{data.treatment}</p>
                      </div>

                      <div className="detail-section warning">
                        <h4>🚨 When to See a Doctor</h4>
                        <p>{data.warning}</p>
                      </div>
                    </div>
                  )}

                  {isExpanded && !data && (
                    <div className="card-details animate-fade-in-down">
                      <p className="disease-desc">Detailed information for this condition is being updated. Please consult a healthcare professional for accurate diagnosis and treatment.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state animate-fade-in-up">
              <span className="empty-icon">🔍</span>
              <p>No diseases found matching "{search}"</p>
              <button onClick={() => { setSearch(''); setFilterSeverity('all'); }} className="btn btn-secondary">Clear Filters</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
