import { useState } from 'react';
import { api } from '../api/client';

interface Props {
  libraryName: string;
  onLog: (msg: string) => void;
  onPreviewUrl: (url: string) => void;
}

export default function ActionPanel({ libraryName, onLog, onPreviewUrl }: Props) {
  const [componentName, setComponentName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<{ ok: boolean; log?: string; message?: string; previewUrl?: string; path?: string; files?: string[] }>) {
    setBusy(label);
    try {
      const result = await fn();
      const msg = result.log ?? result.message ?? (result.ok ? 'Done.' : 'Failed.');
      onLog(`[${label}] ${msg}`);
      if (result.previewUrl) onPreviewUrl(result.previewUrl);
    } catch (err) {
      onLog(`[${label}] Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>⚙️ Actions — {libraryName}</div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Library</p>
        <button
          style={styles.btn}
          disabled={!!busy}
          onClick={() => run('Create Library', api.createLibrary)}
        >
          {busy === 'Create Library' ? '…' : 'Create Library'}
        </button>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Component</p>
        <input
          type="text"
          placeholder="ComponentName"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.btn}
          disabled={!!busy || !componentName.trim()}
          onClick={() => run('Create Component', () => api.createComponent(componentName.trim()))}
        >
          {busy === 'Create Component' ? '…' : 'Create Component'}
        </button>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Preview</p>
        <button
          style={styles.btn}
          disabled={!!busy}
          onClick={() => run('Start Preview', api.startPreview)}
        >
          {busy === 'Start Preview' ? '…' : 'Start Preview'}
        </button>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Deploy</p>
        <button
          style={{ ...styles.btn, background: '#0ea5e9' }}
          disabled={!!busy}
          onClick={() => run('Push Dev', api.pushDev)}
        >
          {busy === 'Push Dev' ? '…' : 'Push Dev'}
        </button>
        <button
          style={{ ...styles.btn, background: '#10b981' }}
          disabled={!!busy}
          onClick={() => run('Deploy', api.deploy)}
        >
          {busy === 'Deploy' ? '…' : 'Deploy'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1d27',
    borderLeft: '1px solid #2a2d3e',
    minWidth: '200px',
  },
  header: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #2a2d3e',
    color: '#e2e8f0',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  section: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #2a2d3e',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  sectionTitle: {
    margin: '0 0 0.25rem',
    color: '#64748b',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '0.4rem 0.6rem',
    borderRadius: '5px',
    border: '1px solid #2a2d3e',
    background: '#0f1117',
    color: '#e2e8f0',
    fontSize: '0.8rem',
    outline: 'none',
  },
  btn: {
    padding: '0.45rem 0.75rem',
    borderRadius: '5px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
