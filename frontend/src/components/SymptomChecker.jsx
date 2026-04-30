import { useState, useRef, useEffect, useCallback } from 'react';
import { suggestSymptoms, predictDisease } from '../services/api';
import '../styles/SymptomChecker.css';

const BODY_SYSTEMS = [
  { id: 'general', label: 'General', icon: '🌡️', symptoms: ['fever', 'fatigue', 'chills', 'sweating', 'night sweats', 'weight loss', 'loss of appetite'] },
  { id: 'head', label: 'Head & Neuro', icon: '🧠', symptoms: ['headache', 'severe headache', 'dizziness', 'confusion', 'memory loss', 'sensitivity to light', 'sensitivity to sound', 'loss of taste or smell'] },
  { id: 'respiratory', label: 'Respiratory', icon: '🫁', symptoms: ['cough', 'shortness of breath', 'wheezing', 'chest pain', 'chest tightness', 'sore throat', 'runny nose', 'difficulty breathing'] },
  { id: 'digestive', label: 'Digestive', icon: '🫃', symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'stomach pain', 'bloating', 'heartburn', 'loss of appetite'] },
  { id: 'skin', label: 'Skin', icon: '🖐️', symptoms: ['rash', 'itching', 'skin changes', 'mole changes', 'skin lesions', 'itchy rash', 'pale skin'] },
  { id: 'musculoskeletal', label: 'Muscles & Joints', icon: '💪', symptoms: ['joint pain', 'muscle pain', 'swelling', 'stiffness', 'reduced range of motion', 'muscle stiffness', 'body aches'] },
];

export function SymptomChecker({ onPredict }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSystem, setActiveSystem] = useState('general');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [step, setStep] = useState(1);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const data = await suggestSymptoms(query);
      setSuggestions(data.suggestions.filter(s =>
        !selectedSymptoms.includes(s.symptom)
      ).slice(0, 8));
    } catch {
      setSuggestions([]);
    }
  }, [selectedSymptoms]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchQuery) fetchSuggestions(searchQuery);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
    setSearchQuery('');
    setSuggestions([]);
    searchRef.current?.querySelector('input')?.focus();
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length < 2) {
      setError('Please select at least 2 symptoms for an accurate prediction');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await predictDisease(selectedSymptoms);
      onPredict(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentSystem = BODY_SYSTEMS.find(s => s.id === activeSystem);
  const availableSymptoms = currentSystem?.symptoms.filter(s =>
    !selectedSymptoms.includes(s)
  ) || [];

  return (
    <div className="symptom-checker">
      <div className="checker-header animate-fade-in-up">
        <h1>🔍 Symptom Checker</h1>
        <p>Select your symptoms below. The more symptoms you add, the more accurate the prediction.</p>
      </div>

      <div className="progress-bar animate-fade-in-up stagger-1">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Select</span>
        </div>
        <div className={`progress-connector ${step >= 2 ? 'filled' : ''}`} />
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Review</span>
        </div>
        <div className={`progress-connector ${step >= 3 ? 'filled' : ''}`} />
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Predict</span>
        </div>
      </div>

      {step === 1 && (
        <div className="checker-body animate-fade-in-up stagger-2">
          <div className="system-tabs">
            {BODY_SYSTEMS.map(sys => (
              <button
                key={sys.id}
                className={`system-tab ${activeSystem === sys.id ? 'active' : ''}`}
                onClick={() => setActiveSystem(sys.id)}
              >
                <span className="tab-icon">{sys.icon}</span>
                <span className="tab-label">{sys.label}</span>
              </button>
            ))}
          </div>

          <div className="search-section" ref={searchRef}>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search symptoms..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="symptom-search"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown animate-fade-in-down">
                {suggestions.map((s) => (
                  <button
                    key={s.symptom}
                    className="suggestion-item"
                    onClick={() => addSymptom(s.symptom)}
                  >
                    <span className="suggestion-name">{s.symptom}</span>
                    <span className="suggestion-score">{Math.round(s.score)}% match</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="symptom-grid">
            <h3>{currentSystem?.icon} {currentSystem?.label} Symptoms</h3>
            <div className="symptom-chips">
              {availableSymptoms.map(symptom => (
                <button
                  key={symptom}
                  className="symptom-chip"
                  onClick={() => addSymptom(symptom)}
                >
                  + {symptom}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="checker-body animate-fade-in-up stagger-2">
          <h2>📋 Review Your Symptoms</h2>
          <p className="review-subtitle">You have selected {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''}</p>
          <div className="selected-symptoms-list">
            {selectedSymptoms.map((symptom, i) => (
              <div key={symptom} className="selected-symptom-item animate-fade-in-left" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="symptom-index">{i + 1}</span>
                <span className="symptom-name">{symptom}</span>
                <button className="remove-btn" onClick={() => removeSymptom(symptom)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="checker-footer animate-fade-in-up stagger-3">
        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="footer-actions">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}

          {step === 1 && selectedSymptoms.length > 0 && (
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Review Symptoms ({selectedSymptoms.length})
            </button>
          )}

          {step === 2 && (
            <button
              className="btn btn-primary btn-lg pulse-btn"
              onClick={handlePredict}
              disabled={loading || selectedSymptoms.length < 2}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>🩺 Predict Disease</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
