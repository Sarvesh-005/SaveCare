import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal bootstrap entry — full app shell arrives in Task 8.
// This lets the Vite build succeed so the pipeline is verifiable end-to-end.
function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 40, color: '#0E7C7B' }}>
      <h1>☥ CareSave HMS</h1>
      <p>Backend core logic is in place and tested (28/28 passing).</p>
      <p>Frontend shell + login arrive in the next build step.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
