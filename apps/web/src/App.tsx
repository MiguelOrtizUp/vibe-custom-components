import React, { useEffect, useState, useCallback } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ActionPanel } from './components/ActionPanel';
import { PreviewPane } from './components/PreviewPane';
import { LogPanel } from './components/LogPanel';
import { useLogs } from './hooks/useLogs';
import { runnerApi } from './api';
import type { SessionStatus } from './api';
import './index.css';

type AppState = 'loading' | 'onboarding' | 'session';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [runnerOnline, setRunnerOnline] = useState<boolean | null>(null);
  const { logs, connected, clear } = useLogs();

  const loadSession = useCallback(async () => {
    try {
      await runnerApi.health();
      setRunnerOnline(true);
      const s = await runnerApi.getSession();
      if (s.active) {
        setSession(s);
        if (s.previewUrl) setPreviewUrl(s.previewUrl);
        setAppState('session');
      } else {
        setAppState('onboarding');
      }
    } catch {
      setRunnerOnline(false);
      setAppState('onboarding');
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleSessionStarted = async () => {
    const s = await runnerApi.getSession();
    setSession(s);
    setAppState('session');
  };

  const handleDisconnect = async () => {
    await runnerApi.disconnect().catch(() => {});
    setSession(null);
    setPreviewUrl(null);
    setAppState('onboarding');
  };

  if (appState === 'loading') {
    return (
      <div style={loadingStyle}>
        <span>Starting up…</span>
      </div>
    );
  }

  if (appState === 'onboarding') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {runnerOnline === false && (
          <div style={bannerStyle}>
            ⚠️ Cannot reach runner on <code>http://localhost:3001</code>. Make sure{' '}
            <code>npm run dev</code> is running.
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <OnboardingScreen onSessionStarted={handleSessionStarted} />
        </div>
        <div style={logFooterStyle}>
          <LogPanel logs={logs} connected={connected} onClear={clear} />
        </div>
      </div>
    );
  }

  // Main workspace view
  return (
    <div style={layoutStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <span style={logoStyle}>⚡ Vibe Custom Components</span>
        <span style={orgStyle}>
          {session?.orgDomain} / {session?.libraryName}
        </span>
      </div>

      {/* Main content area */}
      <div style={mainStyle}>
        {/* Left: Action panel */}
        <div style={leftPaneStyle}>
          {session && (
            <ActionPanel
              session={session}
              onDisconnect={handleDisconnect}
              onPreviewStarted={(url) => setPreviewUrl(url)}
            />
          )}
        </div>

        {/* Center: Preview */}
        <div style={centerPaneStyle}>
          <PreviewPane previewUrl={previewUrl} />
        </div>

        {/* Right: Logs */}
        <div style={rightPaneStyle}>
          <LogPanel logs={logs} connected={connected} onClear={clear} />
        </div>
      </div>
    </div>
  );
}

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  color: '#4b5563',
  fontSize: 16,
};

const bannerStyle: React.CSSProperties = {
  background: '#78350f',
  borderBottom: '1px solid #d97706',
  padding: '10px 16px',
  fontSize: 13,
  color: '#fef3c7',
  flexShrink: 0,
};

const logFooterStyle: React.CSSProperties = {
  height: 160,
  flexShrink: 0,
  borderTop: '1px solid #1e293b',
};

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 16px',
  background: '#0a0d14',
  borderBottom: '1px solid #1e293b',
  flexShrink: 0,
  gap: 16,
};

const logoStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  color: '#60a5fa',
};

const orgStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#4b5563',
  marginLeft: 'auto',
};

const mainStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
  gap: 0,
};

const leftPaneStyle: React.CSSProperties = {
  width: 260,
  flexShrink: 0,
  padding: 8,
  borderRight: '1px solid #1e293b',
  overflow: 'hidden',
};

const centerPaneStyle: React.CSSProperties = {
  flex: 1,
  padding: 8,
  overflow: 'hidden',
};

const rightPaneStyle: React.CSSProperties = {
  width: 360,
  flexShrink: 0,
  padding: 8,
  borderLeft: '1px solid #1e293b',
  overflow: 'hidden',
};
