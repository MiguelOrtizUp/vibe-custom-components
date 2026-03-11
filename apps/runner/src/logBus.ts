import { EventEmitter } from 'events';
import { Response } from 'express';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  ts: string;
  level: LogLevel;
  message: string;
}

const MAX_BUFFERED = 500;

class LogBus extends EventEmitter {
  private buffer: LogEntry[] = [];

  emit(event: 'log', entry: LogEntry): boolean;
  emit(event: string, ...args: unknown[]): boolean;
  emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  log(level: LogLevel, message: string): void {
    const entry: LogEntry = { ts: new Date().toISOString(), level, message };
    this.buffer.push(entry);
    if (this.buffer.length > MAX_BUFFERED) this.buffer.shift();
    this.emit('log', entry);
    // Mirror to console (never log secrets — callers are responsible for sanitizing)
    const consoleFn =
      level === 'error'
        ? console.error
        : level === 'warn'
        ? console.warn
        : level === 'debug'
        ? console.debug
        : console.log;
    consoleFn(`[${entry.ts}] [${level.toUpperCase()}] ${message}`);
  }

  info(message: string): void {
    this.log('info', message);
  }
  warn(message: string): void {
    this.log('warn', message);
  }
  error(message: string): void {
    this.log('error', message);
  }
  debug(message: string): void {
    this.log('debug', message);
  }

  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Attach an Express response as an SSE subscriber.
   * Replays buffered logs first, then streams new ones.
   */
  attachSSE(res: Response): () => void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Replay buffered logs
    for (const entry of this.buffer) {
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    }

    const handler = (entry: LogEntry) => {
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    };
    this.on('log', handler);

    // Heartbeat to keep connection alive
    const hb = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    const cleanup = () => {
      clearInterval(hb);
      this.off('log', handler);
    };
    res.on('close', cleanup);
    return cleanup;
  }
}

export const logBus = new LogBus();
