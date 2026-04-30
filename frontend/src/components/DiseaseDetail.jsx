import { useState, useEffect } from 'react';
import { getDiseaseInfo } from '../services/api';
import '../styles/DiseaseDetail.css';

export function DiseaseDetail({ name, onBack }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDiseaseInfo(name);
        if (!cancelled) setInfo(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInfo();
    return () => { cancelled = true; };
  }, [name]);

  const severityColors = {
    low: '#22c55e',
    moderate: '#f59e0b',
    high: '#dc2626',
    unknown: '#94a3b8',
  };

  return (
    <div className="disease-detail animate-fade-in-up">
      <button className="back-btn" onClick={onBack}>
        ← Back to Results
      </button>

      {loading && (
        <div className="detail-loading">
          <div className="spinner-lg" />
          <p>Loading disease information...</p>
        </div>
      )}

      {error && (
        <div className="detail-error">
          <p>⚠️ {error}</p>
          <button onClick={onBack} className="btn btn-secondary">Go Back</button>
        </div>
      )}

      {info && (
        <>
          <div className="detail-header">
            <h1>{info.name}</h1>
            <span className="severity-badge" style={{
              background: `${severityColors[info.severity]}22`,
              color: severityColors[info.severity],
              borderColor: `${severityColors[info.severity]}44`
            }}>
              {info.severity.charAt(0).toUpperCase() + info.severity.slice(1)} Severity
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-card">
              <h3>📋 Description</h3>
              <p>{info.description}</p>
            </div>

            <div className="detail-card">
              <h3>⏱️ Duration</h3>
              <p>{info.duration}</p>
            </div>

            <div className="detail-card warning">
              <h3>🚨 When to See a Doctor</h3>
              <p>{info.when_to_see_doctor}</p>
            </div>

            <div className="detail-card success">
              <h3>💊 Care Tips</h3>
              <p>{info.care_tips}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
