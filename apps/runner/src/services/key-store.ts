/**
 * Secure key storage using Windows Credential Manager (via keytar).
 * Falls back to in-memory only if keytar is unavailable on the current platform.
 */
let keytar: typeof import('keytar') | null = null;

try {
  // keytar is an optional native module – it may not build on all environments.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  keytar = require('keytar');
} catch {
  console.warn('[key-store] keytar not available – API key will not be persisted across restarts.');
}

const SERVICE = 'vibe-custom-components';
const ACCOUNT = 'retool-api-key';

export async function saveApiKey(apiKey: string): Promise<void> {
  if (keytar) {
    await keytar.setPassword(SERVICE, ACCOUNT, apiKey);
  }
  // In-memory fallback is handled by session-store.ts
}

export async function loadApiKey(): Promise<string | null> {
  if (keytar) {
    return keytar.getPassword(SERVICE, ACCOUNT);
  }
  return null;
}

export async function deleteApiKey(): Promise<void> {
  if (keytar) {
    await keytar.deletePassword(SERVICE, ACCOUNT);
  }
}
