import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export const DEFAULT_WORKSPACE_ROOT = path.join(
  os.homedir(),
  '.vibe-custom-components',
  'workspaces'
);

export const SECRET_SERVICE = 'vibe-custom-components';
export const SECRET_ACCOUNT = 'retool-api-key';

/** Warning shown when falling back to file-based secret storage */
export const FILE_SECRET_WARNING =
  '[SECURITY WARNING] Windows Credential Manager (keytar) is not available. ' +
  'API key will be stored in a local config file. ' +
  'Set VIBE_DISABLE_FILE_SECRET=true to disable this fallback and always re-enter the key each session.';

export const CONFIG_FILE_PATH = path.join(os.homedir(), '.vibe-custom-components', 'config.json');

export const RUNNER_PORT = process.env.RUNNER_PORT ? parseInt(process.env.RUNNER_PORT, 10) : 3001;
