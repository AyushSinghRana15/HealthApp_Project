import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SymptomChecker } from './components/SymptomChecker';
import { ResultsPanel } from './components/ResultsPanel';
import { HealthTracker } from './components/HealthTracker';
import { DiseaseCatalog } from './components/DiseaseCatalog';
import './styles/App.css';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [predictionResults, setPredictionResults] = useState(null);

  const handlePrediction = useCallback((results) => {
    setPredictionResults(results);
    setActivePage('results');
  }, []);

  const handleNavigate = useCallback((page) => {
    setActivePage(page);
    if (page !== 'results') {
      setPredictionResults(null);
    }
  }, []);

  return (
    <>
      <Navbar activePage={activePage} onNavigate={handleNavigate} />
      <main className="main-content">
        {activePage === 'home' && (
          <Hero onGetStarted={() => handleNavigate('predict')} />
        )}
        {activePage === 'predict' && (
          <SymptomChecker onPredict={handlePrediction} />
        )}
        {activePage === 'results' && predictionResults && (
          <ResultsPanel results={predictionResults} onNewCheck={() => handleNavigate('predict')} />
        )}
        {activePage === 'tracker' && <HealthTracker />}
        {activePage === 'diseases' && <DiseaseCatalog />}
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <p>Health Monitor AI &copy; 2026. Not a substitute for professional medical advice.</p>
          <p className="footer-disclaimer">Always consult a healthcare professional for diagnosis and treatment.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
