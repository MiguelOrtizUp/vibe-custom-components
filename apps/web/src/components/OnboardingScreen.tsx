import React, { useState } from 'react';
import { runnerApi } from '../api';
import type { StartSessionPayload } from '../api';

interface Props {
  onSessionStarted: () => void;
}

export function OnboardingScreen({ onSessionStarted }: Props) {
  const [form, setForm] = useState<StartSessionPayload>({
    apiKey: '',
    orgDomain: '',
    libraryName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await runnerApi.startSession(form);
      onSessionStarted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>⚡ Vibe</span>
          <span style={styles.logoSub}>Custom Components</span>
        </div>

        <h2 style={styles.heading}>Connect to Retool</h2>
        <p style={styles.subheading}>
          Enter your Retool credentials to start building custom components locally.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Retool API Key
            <input
              name="apiKey"
              type="password"
              value={form.apiKey}
              onChange={handleChange}
              placeholder="retool_…"
              required
              style={styles.input}
              autoComplete="current-password"
            />
            <span style={styles.hint}>
              Found in your Retool account settings → API keys. Stored securely on your machine.
            </span>
          </label>

          <label style={styles.label}>
            Retool Org / Domain
            <input
              name="orgDomain"
              type="text"
              value={form.orgDomain}
              onChange={handleChange}
              placeholder="myorg.retool.com"
              required
              style={styles.input}
              autoComplete="off"
            />
            <span style={styles.hint}>
              e.g. <code style={styles.code}>myorg.retool.com</code> or just{' '}
              <code style={styles.code}>myorg</code>
            </span>
          </label>

          <label style={styles.label}>
            Library Name
            <input
              name="libraryName"
              type="text"
              value={form.libraryName}
              onChange={handleChange}
              placeholder="my-component-library"
              required
              pattern="[a-zA-Z0-9_-]+"
              title="Letters, numbers, hyphens and underscores only"
              style={styles.input}
              autoComplete="off"
            />
            <span style={styles.hint}>Letters, numbers, hyphens, underscores.</span>
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Connecting…' : 'Start Session →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 24,
    background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)',
  },
  card: {
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: 12,
    padding: '40px 48px',
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  logo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 28,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 800,
    color: '#60a5fa',
  },
  logoSub: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: 400,
  },
  heading: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 700,
    color: '#f1f5f9',
  },
  subheading: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    fontSize: 14,
    fontWeight: 500,
    color: '#e2e8f0',
  },
  input: {
    background: '#0f1117',
    border: '1px solid #374151',
    borderRadius: 6,
    padding: '10px 12px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
  },
  code: {
    background: '#1f2937',
    padding: '1px 4px',
    borderRadius: 3,
    fontFamily: 'monospace',
  },
  error: {
    background: '#450a0a',
    border: '1px solid #dc2626',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 13,
    color: '#fca5a5',
  },
  btn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '12px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'background 0.15s',
  },
};
