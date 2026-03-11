import React from 'react';
import type { LogEntry } from '../hooks/useLogs';

const LEVEL_COLOR: Record<LogEntry['level'], string> = {
  info: '#93c5fd',
  warn: '#fbbf24',
  error: '#f87171',
  debug: '#a3e635',
};

interface Props {
  logs: LogEntry[];
  connected: boolean;
  onClear: () => void;
}

export function LogPanel({ logs, connected, onClear }: Props) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Logs</span>
        <span style={{ ...styles.badge, background: connected ? '#16a34a' : '#dc2626' }}>
          {connected ? '● Live' : '○ Disconnected'}
        </span>
        <button onClick={onClear} style={styles.clearBtn}>
          Clear
        </button>
      </div>
      <div style={styles.body}>
        {logs.length === 0 && (
          <div style={styles.empty}>No logs yet. Start a session to see activity.</div>
        )}
        {logs.map((entry, i) => (
          <div key={i} style={styles.row}>
            <span style={styles.ts}>{entry.ts.slice(11, 23)}</span>
            <span style={{ ...styles.level, color: LEVEL_COLOR[entry.level] }}>
              {entry.level.toUpperCase().padEnd(5)}
            </span>
            <span style={styles.msg}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#0a0d14',
    border: '1px solid #1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: '#111827',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  title: {
    fontWeight: 600,
    fontSize: 13,
    color: '#e2e8f0',
  },
  badge: {
    fontSize: 11,
    borderRadius: 4,
    padding: '2px 6px',
    color: '#fff',
    fontWeight: 500,
    marginLeft: 'auto',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid #374151',
    color: '#9ca3af',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 11,
    cursor: 'pointer',
  },
  body: {
    overflowY: 'auto' as const,
    flex: 1,
    padding: '8px 12px',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 1.6,
  },
  empty: {
    color: '#4b5563',
    fontStyle: 'italic' as const,
  },
  row: {
    display: 'flex',
    gap: 8,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  ts: {
    color: '#4b5563',
    flexShrink: 0,
  },
  level: {
    flexShrink: 0,
    fontWeight: 600,
  },
  msg: {
    color: '#d1d5db',
  },
};
