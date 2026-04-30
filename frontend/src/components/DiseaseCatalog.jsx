import { useState, useEffect } from 'react';
import { listDiseases } from '../services/api';
import '../styles/DiseaseCatalog.css';

export function DiseaseCatalog() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    listDiseases()
      .then(data => setDiseases(data.diseases))
      .catch(() => setDiseases([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = diseases.filter(d =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="disease-catalog">
      <div className="catalog-header animate-fade-in-up">
        <h1>📖 Disease Encyclopedia</h1>
        <p>Browse all diseases covered by our AI model</p>
      </div>

      <div className="catalog-search animate-fade-in-up stagger-1">
        <input
          type="text"
          placeholder="Search diseases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="catalog-card skeleton" />
          ))}
        </div>
      ) : (
        <>
          <p className="count-badge animate-fade-in-up stagger-2">{filtered.length} disease{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="catalog-grid">
            {filtered.map((disease, i) => (
              <div
                key={disease}
                className="catalog-card animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s` }}
              >
                <div className="card-icon">{disease.charAt(0)}</div>
                <h3>{disease}</h3>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
