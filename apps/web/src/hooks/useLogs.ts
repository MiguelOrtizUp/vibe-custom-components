import { useEffect, useRef, useState, useCallback } from 'react';
import { RUNNER_API } from '../constants';

export interface LogEntry {
  ts: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(`${RUNNER_API}/logs/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const entry = JSON.parse(e.data) as LogEntry;
        setLogs((prev) => [...prev.slice(-499), entry]);
      } catch {
        // ignore malformed
      }
    };

    es.onerror = () => {
      setConnected(false);
      // Reconnect after a delay
      setTimeout(() => {
        if (esRef.current === es) connect();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  const clear = () => setLogs([]);

  return { logs, connected, clear };
}
