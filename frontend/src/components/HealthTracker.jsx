import { useState } from 'react';
import '../styles/HealthTracker.css';

export function HealthTracker() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('bmi_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h === 0) return;
    const bmi = w / (h * h);
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      bmi: bmi.toFixed(1),
      weight: w,
      height: parseFloat(height),
      age: parseInt(age),
    };
    const newHistory = [entry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('bmi_history', JSON.stringify(newHistory));
  };

  const getCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    if (bmi < 25) return { label: 'Normal', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Obese', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' };
  };

  const currentBMI = weight && height ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1) : null;
  const category = currentBMI ? getCategory(parseFloat(currentBMI)) : null;

  return (
    <div className="health-tracker">
      <div className="tracker-header animate-fade-in-up">
        <h1>📊 Health Tracker</h1>
        <p>Calculate your BMI and track your health metrics over time</p>
      </div>

      <div className="tracker-grid">
        <div className="tracker-card animate-fade-in-up stagger-1">
          <h2>Calculate BMI</h2>
          <div className="input-group">
            <label>Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" min="1" />
          </div>
          <div className="input-group">
            <label>Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" min="1" />
          </div>
          <div className="input-group">
            <label>Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 25" min="1" />
          </div>
          <button className="btn btn-primary" onClick={calculateBMI} disabled={!weight || !height}>
            Calculate & Save
          </button>
        </div>

        <div className="tracker-card animate-fade-in-up stagger-2">
          <h2>Current Result</h2>
          {currentBMI ? (
            <div className="result-display">
              <div className="bmi-circle" style={{ borderColor: category.color }}>
                <span className="bmi-value" style={{ color: category.color }}>{currentBMI}</span>
                <span className="bmi-label">BMI</span>
              </div>
              <span className="bmi-category" style={{ background: category.bg, color: category.color }}>
                {category.label}
              </span>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📏</span>
              <p>Enter your details to see your BMI</p>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-card animate-fade-in-up stagger-3">
          <h2>📈 History</h2>
          <div className="history-list">
            {history.map((entry, i) => {
              const cat = getCategory(parseFloat(entry.bmi));
              return (
                <div key={entry.id} className="history-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="history-date">{entry.date}</span>
                  <span className="history-bmi" style={{ color: cat.color }}>{entry.bmi}</span>
                  <span className="history-category" style={{ background: cat.bg, color: cat.color }}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
