const API_BASE = '/api';

export async function predictDisease(symptoms) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Prediction failed');
  }
  return res.json();
}

export async function suggestSymptoms(query) {
  const res = await fetch(`${API_BASE}/symptoms/suggest?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Suggestion failed');
  return res.json();
}

export async function validateSymptoms(symptoms) {
  const res = await fetch(`${API_BASE}/symptoms/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });
  if (!res.ok) throw new Error('Validation failed');
  return res.json();
}

export async function getDiseaseInfo(name) {
  const res = await fetch(`${API_BASE}/disease/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to fetch disease info');
  return res.json();
}

export async function listDiseases() {
  const res = await fetch(`${API_BASE}/diseases`);
  if (!res.ok) throw new Error('Failed to list diseases');
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
