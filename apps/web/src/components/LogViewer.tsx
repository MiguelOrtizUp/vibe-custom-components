import { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export default function LogViewer({ logs }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>📋 Logs</div>
      <div style={styles.body}>
        {logs.length === 0 && <span style={styles.empty}>No logs yet.</span>}
        {logs.map((entry, i) => (
          <div key={i} style={styles.entry}>
            <span style={styles.ts}>{entry.timestamp}</span>
            <span style={styles.msg}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0f1117',
    borderTop: '1px solid #2a2d3e',
    height: '160px',
  },
  header: {
    padding: '0.35rem 1rem',
    borderBottom: '1px solid #2a2d3e',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '0.8rem',
    background: '#1a1d27',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.4rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  entry: {
    display: 'flex',
    gap: '0.6rem',
    fontSize: '0.78rem',
    fontFamily: 'monospace',
  },
  ts: {
    color: '#475569',
    flexShrink: 0,
  },
  msg: {
    color: '#a3e635',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  empty: {
    color: '#475569',
    fontSize: '0.78rem',
    fontFamily: 'monospace',
  },
};
