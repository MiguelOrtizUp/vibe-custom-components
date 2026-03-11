/**
 * Workspace management.
 * Workspaces are stored under %USERPROFILE%\.vibe-custom-components\workspaces\ on Windows
 * and ~/.vibe-custom-components/workspaces/ on macOS/Linux.
 */
import path from 'path';
import fs from 'fs';
import os from 'os';

const BASE_DIR = path.join(os.homedir(), '.vibe-custom-components', 'workspaces');

export function getWorkspaceDir(libraryName: string): string {
  return path.join(BASE_DIR, libraryName);
}

export function ensureWorkspace(libraryName: string): string {
  const dir = getWorkspaceDir(libraryName);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function workspaceExists(libraryName: string): boolean {
  return fs.existsSync(getWorkspaceDir(libraryName));
}
