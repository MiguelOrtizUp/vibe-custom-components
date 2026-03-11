import { useState } from 'react';
import { api } from '../api/client';

interface Props {
  onSuccess: (retoolOrg: string, libraryName: string) => void;
}

export default function OnboardingForm({ onSuccess }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [retoolOrg, setRetoolOrg] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [log, setLog] = useState('');

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLog('');
    try {
      const result = await api.startSession({ apiKey, retoolOrg, libraryName });
      setLog(result.verificationLog);
      if (result.ok) {
        onSuccess(retoolOrg, libraryName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧩 Vibe Custom Components</h1>
        <p style={styles.subtitle}>Connect your Retool workspace to start building custom components.</p>

        <form onSubmit={handleConnect} style={styles.form}>
          <label style={styles.label}>
            Retool API Key
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••••••••••"
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Retool Organization / Subdomain
            <input
              type="text"
              value={retoolOrg}
              onChange={(e) => setRetoolOrg(e.target.value)}
              placeholder="e.g. acme (from acme.retool.com)"
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Library Name
            <input
              type="text"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              placeholder="e.g. my-component-library"
              required
              style={styles.input}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </form>

        {log && (
          <pre style={styles.log}>{log}</pre>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f1117',
    padding: '1rem',
  },
  card: {
    background: '#1a1d27',
    border: '1px solid #2a2d3e',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '480px',
    width: '100%',
  },
  title: {
    margin: '0 0 0.25rem',
    fontSize: '1.5rem',
    color: '#e2e8f0',
  },
  subtitle: {
    margin: '0 0 1.5rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    color: '#cbd5e1',
    fontSize: '0.875rem',
  },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #2a2d3e',
    background: '#0f1117',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.65rem 1.25rem',
    borderRadius: '6px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  error: {
    color: '#f87171',
    fontSize: '0.85rem',
    margin: 0,
  },
  log: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#0f1117',
    borderRadius: '6px',
    color: '#a3e635',
    fontSize: '0.78rem',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  },
};
