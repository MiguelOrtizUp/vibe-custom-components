import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DEFAULT_WORKSPACE_ROOT } from './config';

export interface WorkspaceInfo {
  root: string;
  libraryPath: string;
  libraryName: string;
}

/**
 * Ensure the workspace root directory exists and return info about the named library workspace.
 */
export function getWorkspace(libraryName: string, customRoot?: string): WorkspaceInfo {
  const root = customRoot ?? DEFAULT_WORKSPACE_ROOT;
  const libraryPath = path.join(root, sanitizeName(libraryName));

  if (!fs.existsSync(libraryPath)) {
    fs.mkdirSync(libraryPath, { recursive: true });
  }

  return { root, libraryPath, libraryName };
}

/**
 * List all library workspaces (directory names under the workspace root).
 */
export function listWorkspaces(customRoot?: string): string[] {
  const root = customRoot ?? DEFAULT_WORKSPACE_ROOT;
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/**
 * Sanitize a library/component name to be safe as a directory name.
 */
export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}
