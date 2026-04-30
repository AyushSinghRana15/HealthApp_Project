import { useState } from 'react';
import { DiseaseDetail } from './DiseaseDetail';
import '../styles/ResultsPanel.css';

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: '✅' },
  medium: { label: 'Medium Confidence', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '⚠️' },
  low: { label: 'Low Confidence', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', icon: '❗' },
};

export function ResultsPanel({ results, onNewCheck }) {
  const [selectedDisease, setSelectedDisease] = useState(null);

  const conf = CONFIDENCE_CONFIG[results.confidence] || CONFIDENCE_CONFIG.low;

  return (
    <div className="results-panel">
      {selectedDisease ? (
        <DiseaseDetail name={selectedDisease} onBack={() => setSelectedDisease(null)} />
      ) : (
        <>
          <div className="results-header animate-fade-in-up">
            <h1>🩺 Prediction Results</h1>
            <div className={`confidence-badge ${results.confidence}`} style={{
              background: conf.bg,
              color: conf.color,
              borderColor: `${conf.color}33`
            }}>
              <span className="conf-icon">{conf.icon}</span>
              <span>{conf.label}</span>
            </div>
          </div>

          {results.suggestions && results.suggestions.length > 0 && (
            <div className="suggestions-list animate-fade-in-up stagger-1">
              {results.suggestions.map((s, i) => (
                <div key={i} className="suggestion-chip">💡 {s}</div>
              ))}
            </div>
          )}

          <div className="predictions-list">
            {results.predictions.map((pred, i) => (
              <div
                key={pred.disease}
                className="prediction-card animate-slide-in-scale"
                style={{ animationDelay: `${i * 0.15}s`, opacity: 0 }}
              >
                <div className="prediction-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>

                <div className="prediction-content">
                  <div className="prediction-header">
                    <h3>{pred.disease}</h3>
                    <span className="probability-badge" style={{
                      background: i === 0 ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      color: i === 0 ? 'white' : 'var(--color-text)'
                    }}>
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="probability-bar-container">
                    <div className="probability-bar" style={{
                      width: `${pred.probability * 100}%`,
                      background: i === 0
                        ? 'linear-gradient(90deg, var(--color-primary), var(--color-accent))'
                        : 'var(--color-border)',
                      animation: `progressFill 1s ease ${i * 0.2}s both`
                    }} />
                  </div>

                  {pred.matched_symptoms && pred.matched_symptoms.length > 0 && (
                    <div className="matched-symptoms">
                      <span className="label">Symptoms analyzed:</span>
                      <div className="symptom-tags">
                        {pred.matched_symptoms.slice(0, 6).map(s => (
                          <span key={s} className="tag">{s}</span>
                        ))}
                        {pred.matched_symptoms.length > 6 && (
                          <span className="tag more">+{pred.matched_symptoms.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="learn-more-btn"
                  onClick={() => setSelectedDisease(pred.disease)}
                >
                  Details →
                </button>
              </div>
            ))}
          </div>

          {results.symptom_validation && results.symptom_validation.corrections &&
            Object.keys(results.symptom_validation.corrections).length > 0 && (
            <div className="corrections-panel animate-fade-in-up stagger-3">
              <h4>🔄 Symptom Corrections Applied</h4>
              {Object.entries(results.symptom_validation.corrections).map(([input, corrected]) => (
                <div key={input} className="correction-row">
                  <span className="original">{input}</span>
                  <span className="arrow">→</span>
                  <span className="corrected">{corrected}</span>
                </div>
              ))}
            </div>
          )}

          <div className="results-actions animate-fade-in-up stagger-4">
            <button className="btn btn-primary" onClick={onNewCheck}>
              🔍 New Symptom Check
            </button>
          </div>

          <div className="medical-disclaimer animate-fade-in-up stagger-5">
            <p>⚕️ {results.disclaimer}</p>
          </div>
        </>
      )}
    </div>
  );
}
