import '../styles/Hero.css';

const stats = [
  { value: '50+', label: 'Diseases' },
  { value: '120+', label: 'Symptoms' },
  { value: '95%+', label: 'Accuracy' },
  { value: '<1s', label: 'Response' },
];

export function Hero({ onGetStarted }) {
  return (
    <div className="hero">
      <div className="hero-bg">
        <div className="hero-gradient-orb orb-1" />
        <div className="hero-gradient-orb orb-2" />
        <div className="hero-gradient-orb orb-3" />
      </div>

      <div className="hero-content">
        <div className="hero-badge animate-fade-in-up">
          <span className="badge-dot" />
          AI-Powered Health Intelligence
        </div>

        <h1 className="hero-title animate-fade-in-up stagger-1">
          Predict Diseases with
          <span className="gradient-text"> AI Precision</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up stagger-2">
          Enter your symptoms and get instant, AI-powered disease predictions with confidence scores.
          Stay informed, stay proactive about your health.
        </p>

        <div className="hero-actions animate-fade-in-up stagger-3">
          <button className="btn btn-primary btn-lg pulse-btn" onClick={onGetStarted}>
            <span className="btn-icon">🔍</span>
            Start Symptom Check
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => document.querySelector('.hero-stats')?.scrollIntoView({ behavior: 'smooth' })}>
            Learn More
          </button>
        </div>

        <div className="hero-stats animate-fade-in-up stagger-4">
          {stats.map((stat, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-features animate-fade-in-up stagger-5">
        <h3>Why Choose HealthAI?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h4>Ensemble AI Model</h4>
            <p>4 models working together for maximum prediction accuracy</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h4>Fuzzy Symptom Matching</h4>
            <p>Handles typos, spacing issues, and synonym variations automatically</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Confidence Scores</h4>
            <p>Top 3 predictions with probability percentages</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Instant Results</h4>
            <p>Get predictions in under a second</p>
          </div>
        </div>
      </div>
    </div>
  );
}
