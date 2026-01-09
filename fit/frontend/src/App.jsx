import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard';

function App() {
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected')) {
      setStatus('connected');
    }
  }, []);

  const handleConnect = () => {
    window.location.href = 'http://localhost:8000/auth/google/fit';
  };

  return (
    <div className="app-container">
      <h1 style={{ marginBottom: '2rem' }}>Cognia</h1>

      {status === 'disconnected' && (
        <div className="card">
          <p>Unlock your behavioral intelligence.</p>
          <div style={{ height: '20px' }} />
          <button onClick={handleConnect}>
            Connect Google Fit
          </button>
        </div>
      )}
      {status === 'connecting' && (
        <div className="card"><p>Connecting...</p></div>
      )}

      {status === 'connected' && (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <Dashboard />

          {/* Phase 6: Privacy & Control */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
            <button
              onClick={() => {
                setStatus('disconnected');
                window.history.replaceState({}, document.title, "/");
              }}
              style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
            >
              Disconnect & Stop Monitoring
            </button>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Revoke access in Google Account settings. No clinical diagnosis provided.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
