import * as fs from 'fs';
import * as path from 'path';
import {
  SECRET_SERVICE,
  SECRET_ACCOUNT,
  CONFIG_FILE_PATH,
  FILE_SECRET_WARNING,
} from './config';

let keytarAvailable: boolean | null = null;
let keytar: typeof import('keytar') | null = null;

async function loadKeytar(): Promise<typeof import('keytar') | null> {
  if (keytarAvailable !== null) return keytar;
  try {
    keytar = await import('keytar');
    keytarAvailable = true;
    return keytar;
  } catch {
    keytarAvailable = false;
    return null;
  }
}

function ensureConfigDir(): void {
  const dir = path.dirname(CONFIG_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readConfigFile(): Record<string, string> {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      return JSON.parse(raw) as Record<string, string>;
    }
  } catch {
    // ignore
  }
  return {};
}

function writeConfigFile(data: Record<string, string>): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(data, null, 2), { mode: 0o600 });
}

/**
 * Store the Retool API key securely.
 * Prefers Windows Credential Manager via keytar; falls back to a local config file.
 * Never logs the key value.
 */
export async function storeApiKey(apiKey: string): Promise<{ usedFallback: boolean }> {
  if (process.env.VIBE_DISABLE_FILE_SECRET === 'true') {
    // Only use keytar; if unavailable, do nothing (key stays in memory only)
    const kt = await loadKeytar();
    if (kt) {
      await kt.setPassword(SECRET_SERVICE, SECRET_ACCOUNT, apiKey);
      return { usedFallback: false };
    }
    return { usedFallback: false };
  }

  const kt = await loadKeytar();
  if (kt) {
    await kt.setPassword(SECRET_SERVICE, SECRET_ACCOUNT, apiKey);
    return { usedFallback: false };
  }

  // Fallback: file-based storage
  console.warn(FILE_SECRET_WARNING);
  const config = readConfigFile();
  config.apiKey = apiKey;
  writeConfigFile(config);
  return { usedFallback: true };
}

/**
 * Retrieve the stored Retool API key.
 * Returns null if no key is found.
 */
export async function getStoredApiKey(): Promise<string | null> {
  const kt = await loadKeytar();
  if (kt) {
    return kt.getPassword(SECRET_SERVICE, SECRET_ACCOUNT);
  }

  if (process.env.VIBE_DISABLE_FILE_SECRET !== 'true') {
    const config = readConfigFile();
    return config.apiKey ?? null;
  }
  return null;
}

/**
 * Delete the stored API key from all storage locations.
 */
export async function deleteStoredApiKey(): Promise<void> {
  const kt = await loadKeytar();
  if (kt) {
    await kt.deletePassword(SECRET_SERVICE, SECRET_ACCOUNT);
  }
  // Also clean up file-based storage if present
  const config = readConfigFile();
  if (config.apiKey) {
    delete config.apiKey;
    writeConfigFile(config);
  }
}
