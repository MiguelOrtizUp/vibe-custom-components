import * as child_process from 'child_process';
import { logBus } from './logBus';

export interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Spawn a command in a Windows-friendly way.
 * On Windows, commands are run via `cmd /c` to resolve .cmd wrappers (e.g. npx.cmd).
 * Env vars containing the API key should be passed via `env`; they are never logged.
 */
export function spawnCommand(
  command: string,
  args: string[],
  options: {
    cwd: string;
    env?: NodeJS.ProcessEnv;
    label?: string;
  }
): Promise<SpawnResult> {
  const isWindows = process.platform === 'win32';
  const label = options.label ?? `${command} ${args.join(' ')}`;

  // On Windows we need shell:true or cmd /c to resolve .cmd shims
  const spawnOptions: child_process.SpawnOptions = {
    cwd: options.cwd,
    env: { ...process.env, ...(options.env ?? {}) },
    shell: true, // works on both Windows and Unix; resolves .cmd shims on Windows
    windowsHide: true,
  };

  logBus.info(`[spawn] ${label}`);

  return new Promise((resolve) => {
    const proc = child_process.spawn(command, args, spawnOptions);
    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      for (const line of text.split(/\r?\n/).filter(Boolean)) {
        logBus.info(`  stdout: ${line}`);
      }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      for (const line of text.split(/\r?\n/).filter(Boolean)) {
        logBus.warn(`  stderr: ${line}`);
      }
    });

    proc.on('error', (err) => {
      logBus.error(`[spawn] error for "${label}": ${err.message}`);
      resolve({ code: null, stdout, stderr });
    });

    proc.on('close', (code) => {
      logBus.info(`[spawn] "${label}" exited with code ${code}`);
      resolve({ code, stdout, stderr });
    });
  });
}

/**
 * Spawn a long-lived background process (e.g. Vite dev server).
 * Returns the child process handle.
 */
export function spawnBackground(
  command: string,
  args: string[],
  options: {
    cwd: string;
    env?: NodeJS.ProcessEnv;
    label?: string;
  }
): child_process.ChildProcess {
  const label = options.label ?? `${command} ${args.join(' ')}`;
  logBus.info(`[spawn-bg] starting: ${label}`);

  const spawnOptions: child_process.SpawnOptions = {
    cwd: options.cwd,
    env: { ...process.env, ...(options.env ?? {}) },
    shell: true,
    windowsHide: true,
    detached: false,
  };

  const proc = child_process.spawn(command, args, spawnOptions);

  proc.stdout?.on('data', (chunk: Buffer) => {
    for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) {
      logBus.info(`  [${label}] ${line}`);
    }
  });

  proc.stderr?.on('data', (chunk: Buffer) => {
    for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) {
      logBus.warn(`  [${label}] ${line}`);
    }
  });

  proc.on('error', (err) => {
    logBus.error(`[spawn-bg] error for "${label}": ${err.message}`);
  });

  proc.on('close', (code) => {
    logBus.info(`[spawn-bg] "${label}" exited with code ${code}`);
  });

  return proc;
}
