import { useState } from 'react';
import OnboardingForm from './components/OnboardingForm';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import ActionPanel from './components/ActionPanel';
import LogViewer from './components/LogViewer';
import { LogEntry } from './types';

export default function App() {
  const [session, setSession] = useState<{ retoolOrg: string; libraryName: string } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function addLog(message: string) {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message },
    ]);
  }

  if (!session) {
    return <OnboardingForm onSuccess={(org, lib) => setSession({ retoolOrg: org, libraryName: lib })} />;
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.logo}>🧩 Vibe Custom Components</span>
        <span style={styles.sessionInfo}>
          {session.retoolOrg} / {session.libraryName}
        </span>
        <button
          style={styles.logoutBtn}
          onClick={() => {
            fetch('/api/session/logout', { method: 'POST' }).catch(() => null);
            setSession(null);
          }}
        >
          Disconnect
        </button>
      </header>

      {/* Main workspace */}
      <div style={styles.workspace}>
        {/* LEFT: Chat panel */}
        <div style={styles.chatCol}>
          <ChatPanel libraryName={session.libraryName} onLog={addLog} />
        </div>

        {/* CENTER + BOTTOM: Preview + Logs */}
        <div style={styles.centerCol}>
          <div style={styles.previewArea}>
            <PreviewPanel previewUrl={previewUrl} />
          </div>
          <LogViewer logs={logs} />
        </div>

        {/* RIGHT: Action panel */}
        <div style={styles.actionCol}>
          <ActionPanel
            libraryName={session.libraryName}
            onLog={addLog}
            onPreviewUrl={setPreviewUrl}
          />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f1117',
    color: '#e2e8f0',
    fontFamily: 'system-ui, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 1rem',
    background: '#1a1d27',
    borderBottom: '1px solid #2a2d3e',
    flexShrink: 0,
  },
  logo: {
    fontWeight: 700,
    fontSize: '1rem',
    marginRight: 'auto',
  },
  sessionInfo: {
    color: '#64748b',
    fontSize: '0.82rem',
  },
  logoutBtn: {
    padding: '0.3rem 0.75rem',
    borderRadius: '5px',
    border: '1px solid #2a2d3e',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  chatCol: {
    width: '300px',
    flexShrink: 0,
    overflow: 'hidden',
  },
  centerCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  previewArea: {
    flex: 1,
    overflow: 'hidden',
  },
  actionCol: {
    width: '220px',
    flexShrink: 0,
    overflowY: 'auto',
  },
};
