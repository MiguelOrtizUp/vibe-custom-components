/**
 * In-memory session store.
 * The API key is kept only in process memory (never written to disk in plain text).
 * For persistence across restarts, keytar (Windows Credential Manager) is used as an
 * optional backend – see key-store.ts.
 */
interface Session {
  apiKey: string;
  retoolOrg: string;
  libraryName: string;
  createdAt: Date;
}

let currentSession: Session | null = null;

export function setSession(session: Session): void {
  currentSession = session;
}

export function getSession(): Session | null {
  return currentSession;
}

export function clearSession(): void {
  currentSession = null;
}
