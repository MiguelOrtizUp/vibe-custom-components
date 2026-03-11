/**
 * In-memory session store.
 * Holds the active Retool context for the current local session.
 * Secrets are never written to logs.
 */

export interface Session {
  apiKey: string;
  orgDomain: string;
  libraryName: string;
  workspacePath: string;
  previewUrl?: string;
}

let activeSession: Session | null = null;

export function setSession(session: Session): void {
  activeSession = session;
}

export function getSession(): Session | null {
  return activeSession;
}

export function clearSession(): void {
  activeSession = null;
}

export function requireSession(): Session {
  if (!activeSession) {
    throw new Error('No active session. Please start a session first via POST /api/session/start');
  }
  return activeSession;
}
