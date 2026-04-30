import { useState } from 'react';
import '../styles/Navbar.css';

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'predict', label: 'Symptom Checker', icon: '🔍' },
  { id: 'tracker', label: 'Health Tracker', icon: '📊' },
  { id: 'diseases', label: 'Disease Info', icon: '📖' },
];

export function Navbar({ activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={() => onNavigate('home')}>
          <span className="logo-icon">🩺</span>
          <span className="logo-text">Health<span className="logo-accent">AI</span></span>
        </button>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`toggle-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`toggle-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`toggle-bar ${menuOpen ? 'open' : ''}`} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
