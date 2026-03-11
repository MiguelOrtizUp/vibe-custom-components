/**
 * Retool CCL CLI command wrappers.
 *
 * Reference: https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl
 *
 * Each function logs the exact command being executed before running it,
 * so it is easy to verify commands match the Retool docs.
 *
 * The API key is passed as the RETOOL_TOKEN environment variable and is
 * never interpolated into the command string to prevent accidental logging.
 */

import { spawnCommand } from './spawn';
import type { SpawnResult } from './spawn';
import { logBus } from './logBus';

export interface RetoolContext {
  apiKey: string;
  /** e.g. "myorg.retool.com" or "myorg" */
  orgDomain: string;
}

function buildEnv(ctx: RetoolContext): NodeJS.ProcessEnv {
  return {
    RETOOL_TOKEN: ctx.apiKey,
    // Some versions of retool-ccl also use RETOOL_HOST
    RETOOL_HOST: ctx.orgDomain.includes('.')
      ? `https://${ctx.orgDomain}`
      : `https://${ctx.orgDomain}.retool.com`,
  };
}

/**
 * Create a new custom component library.
 * CLI: npx retool-ccl create <libraryName>
 */
export async function createLibrary(
  ctx: RetoolContext,
  libraryName: string,
  cwd: string
): Promise<SpawnResult> {
  const cmd = 'npx';
  const args = ['retool-ccl', 'create', libraryName];
  logBus.info(`[retool-ccl] Running: npx retool-ccl create ${libraryName} (cwd: ${cwd})`);
  return spawnCommand(cmd, args, { cwd, env: buildEnv(ctx), label: `retool-ccl create ${libraryName}` });
}

/**
 * Initialize the library project in an existing folder.
 * CLI: npx retool-ccl init
 */
export async function initLibrary(
  ctx: RetoolContext,
  cwd: string
): Promise<SpawnResult> {
  const cmd = 'npx';
  const args = ['retool-ccl', 'init'];
  logBus.info(`[retool-ccl] Running: npx retool-ccl init (cwd: ${cwd})`);
  return spawnCommand(cmd, args, { cwd, env: buildEnv(ctx), label: 'retool-ccl init' });
}

/**
 * Start the local Retool CCL dev/preview server.
 * CLI: npx retool-ccl dev
 */
export async function startDev(
  ctx: RetoolContext,
  cwd: string
): Promise<SpawnResult> {
  const cmd = 'npx';
  const args = ['retool-ccl', 'dev'];
  logBus.info(`[retool-ccl] Running: npx retool-ccl dev (cwd: ${cwd})`);
  return spawnCommand(cmd, args, { cwd, env: buildEnv(ctx), label: 'retool-ccl dev' });
}

/**
 * Publish/push to the dev channel.
 * CLI: npx retool-ccl publish --dev
 */
export async function publishDev(
  ctx: RetoolContext,
  cwd: string
): Promise<SpawnResult> {
  const cmd = 'npx';
  const args = ['retool-ccl', 'publish', '--dev'];
  logBus.info(`[retool-ccl] Running: npx retool-ccl publish --dev (cwd: ${cwd})`);
  return spawnCommand(cmd, args, { cwd, env: buildEnv(ctx), label: 'retool-ccl publish --dev' });
}

/**
 * Deploy (release) the library to production.
 * CLI: npx retool-ccl publish
 */
export async function deploy(
  ctx: RetoolContext,
  cwd: string
): Promise<SpawnResult> {
  const cmd = 'npx';
  const args = ['retool-ccl', 'publish'];
  logBus.info(`[retool-ccl] Running: npx retool-ccl publish (cwd: ${cwd})`);
  return spawnCommand(cmd, args, { cwd, env: buildEnv(ctx), label: 'retool-ccl publish' });
}
