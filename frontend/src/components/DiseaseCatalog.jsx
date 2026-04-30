import { useState, useEffect, useCallback } from 'react';
import { listDiseases } from '../services/api';
import { DISEASE_DATA } from '../data/diseaseData';
import '../styles/DiseaseCatalog.css';

export function DiseaseCatalog() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedDisease, setExpandedDisease] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    listDiseases()
      .then(data => setDiseases(data.diseases))
      .catch(() => setDiseases([]))
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = useCallback((disease) => {
    if (expandedDisease === disease) {
      setExpandedDisease(null);
    } else {
      setExpandedDisease(disease);
      setActiveTab('overview');
    }
  }, [expandedDisease]);

  const filtered = diseases.filter(d => {
    const matchesSearch = d.toLowerCase().includes(search.toLowerCase());
    const data = DISEASE_DATA[d];
    const matchesSeverity = filterSeverity === 'all' || (data && data.severity === filterSeverity);
    return matchesSearch && matchesSeverity;
  });

  const severityColors = { low: '#22c55e', moderate: '#f59e0b', high: '#dc2626' };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'remedies', label: 'Remedies', icon: '🌿' },
    { id: 'diet', label: 'Diet', icon: '🥗' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🏃' },
  ];

  return (
    <div className="disease-catalog">
      <div className="catalog-header animate-fade-in-up">
        <h1>📖 Disease Encyclopedia</h1>
        <p>Complete details on {diseases.length} diseases — symptoms, remedies, diet, and lifestyle</p>
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
          <div className="catalog-list">
            {filtered.map((disease, i) => {
              const data = DISEASE_DATA[disease];
              const isExpanded = expandedDisease === disease;
              const severity = data?.severity || 'unknown';

              return (
                <div
                  key={disease}
                  className={`catalog-card detail-card ${isExpanded ? 'expanded' : ''} animate-fade-in-up`}
                  style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s` }}
                >
                  <div className="card-header" onClick={() => handleExpand(disease)}>
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
                      <div className="card-tabs">
                        {tabs.map(tab => (
                          <button
                            key={tab.id}
                            className={`card-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
                          >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {activeTab === 'overview' && (
                        <div className="tab-content animate-fade-in-up">
                          <p className="disease-desc">{data.description}</p>

                          <div className="detail-section">
                            <h4>🩺 Primary Symptoms</h4>
                            <div className="symptom-tags">
                              {data.symptoms.map(s => <span key={s} className="symptom-tag">{s}</span>)}
                            </div>
                          </div>

                          {data.relatedSymptoms && (
                            <div className="detail-section">
                              <h4>🔍 Related Symptoms</h4>
                              <div className="symptom-tags">
                                {data.relatedSymptoms.map(s => <span key={s} className="symptom-tag related">{s}</span>)}
                              </div>
                            </div>
                          )}

                          <div className="detail-row">
                            <div className="detail-item">
                              <span className="detail-label">⏱️ Duration</span>
                              <span className="detail-value">{data.duration}</span>
                            </div>
                          </div>

                          <div className="detail-section treatment">
                            <h4>💊 Medical Treatment</h4>
                            <p>{data.treatment}</p>
                          </div>

                          <div className="detail-section warning">
                            <h4>🚨 When to See a Doctor</h4>
                            <p>{data.warning}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'remedies' && (
                        <div className="tab-content animate-fade-in-up">
                          <div className="remedies-header">
                            <h4>🌿 Home Remedies & Natural Treatments</h4>
                            <p className="remedies-note">These complement — do not replace — medical treatment</p>
                          </div>
                          <div className="remedies-list">
                            {data.remedies.map((remedy, idx) => (
                              <div key={idx} className="remedy-item">
                                <span className="remedy-number">{idx + 1}</span>
                                <p>{remedy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'diet' && (
                        <div className="tab-content animate-fade-in-up">
                          <div className="diet-header">
                            <h4>🥗 Recommended Diet</h4>
                            <p className="diet-note">Nutrition plays a key role in recovery and management</p>
                          </div>
                          <div className="diet-content">
                            {typeof data.diet === 'string' ? (
                              <p className="diet-text">{data.diet}</p>
                            ) : (
                              <div className="diet-list">
                                {data.diet.map((item, idx) => (
                                  <div key={idx} className={`diet-item ${item.startsWith('AVOID') || item.startsWith('STRICTLY') || item.startsWith('Limit') || item.startsWith('Reduce') ? 'avoid' : 'recommended'}`}>
                                    <span className="diet-icon">{item.startsWith('AVOID') || item.startsWith('STRICTLY') || item.startsWith('Limit') || item.startsWith('Reduce') ? '🚫' : '✅'}</span>
                                    <p>{item.replace(/^(AVOID|STRICTLY AVOID|Limit|Reduce):\s*/i, '')}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'lifestyle' && (
                        <div className="tab-content animate-fade-in-up">
                          <div className="lifestyle-header">
                            <h4>🏃 Lifestyle & Prevention Tips</h4>
                            <p className="lifestyle-note">Daily habits that support recovery and prevent complications</p>
                          </div>
                          <div className="lifestyle-list">
                            {(typeof data.lifestyle === 'string' ? [data.lifestyle] : data.lifestyle).map((tip, idx) => (
                              <div key={idx} className="lifestyle-item">
                                <span className="lifestyle-number">{idx + 1}</span>
                                <p>{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
