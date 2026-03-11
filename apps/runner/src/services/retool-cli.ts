/**
 * Retool CLI wrapper.
 *
 * Each method returns a promise that resolves with the CLI stdout/stderr text.
 * The API key is injected via environment variable (never logged or stored in plain text).
 *
 * Phase 1: commands are stubbed – they log the exact CLI invocation that *would* run
 * so you can verify the workflow before wiring in the real `retool` binary.
 */
import { spawn } from 'child_process';
import { getSession } from './session-store';

export interface CliResult {
  exitCode: number;
  output: string;
}

function stubLog(command: string): CliResult {
  const msg = `[stub] Would run: ${command}`;
  console.log(msg);
  return { exitCode: 0, output: msg };
}

/**
 * Verify the API key is valid by listing Retool resources.
 * Retool CLI docs: https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl
 */
export async function verifyApiKey(): Promise<CliResult> {
  const session = getSession();
  if (!session) return { exitCode: 1, output: 'No active session.' };

  // Real command: RETOOL_API_KEY=<key> npx retool-ccl whoami
  return stubLog(`RETOOL_API_KEY=*** npx retool-ccl whoami --org ${session.retoolOrg}`);
}

/**
 * Create a new Retool Custom Component Library.
 */
export async function createLibrary(): Promise<CliResult> {
  const session = getSession();
  if (!session) return { exitCode: 1, output: 'No active session.' };

  // Real command: RETOOL_API_KEY=<key> npx retool-ccl create <libraryName>
  return stubLog(`RETOOL_API_KEY=*** npx retool-ccl create ${session.libraryName} --org ${session.retoolOrg}`);
}

/**
 * Push the current component library to Retool (development mode).
 */
export async function pushDev(workspaceDir: string): Promise<CliResult> {
  const session = getSession();
  if (!session) return { exitCode: 1, output: 'No active session.' };

  // Real command: RETOOL_API_KEY=<key> npx retool-ccl dev
  return stubLog(`cd "${workspaceDir}" && RETOOL_API_KEY=*** npx retool-ccl dev`);
}

/**
 * Deploy (publish) the component library to Retool Cloud.
 */
export async function deploy(workspaceDir: string): Promise<CliResult> {
  const session = getSession();
  if (!session) return { exitCode: 1, output: 'No active session.' };

  // Real command: RETOOL_API_KEY=<key> npx retool-ccl publish
  return stubLog(`cd "${workspaceDir}" && RETOOL_API_KEY=*** npx retool-ccl publish`);
}

/**
 * Run a raw CLI command with the API key injected via env var.
 * Use this for advanced / future commands.
 */
export function runCliCommand(args: string[]): Promise<CliResult> {
  return new Promise((resolve) => {
    const session = getSession();
    const env = { ...process.env };
    if (session) {
      env['RETOOL_API_KEY'] = session.apiKey;
    }

    const [cmd, ...rest] = args;
    let output = '';

    const child = spawn(cmd, rest, { env, shell: true });

    child.stdout.on('data', (d) => { output += d.toString(); });
    child.stderr.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => {
      resolve({ exitCode: code ?? 1, output });
    });
  });
}
