import { RUNNER_API } from './constants';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${RUNNER_API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

export interface SessionStatus {
  active: boolean;
  orgDomain?: string;
  libraryName?: string;
  workspacePath?: string;
  previewUrl?: string | null;
}

export interface StartSessionPayload {
  apiKey: string;
  orgDomain: string;
  libraryName: string;
}

export const runnerApi = {
  health: () => apiFetch<{ status: string }>('/health'),

  getSession: () => apiFetch<SessionStatus>('/session'),

  startSession: (payload: StartSessionPayload) =>
    apiFetch<{ ok: boolean; orgDomain: string; libraryName: string; workspacePath: string }>(
      '/session/start',
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  stopSession: () => apiFetch<{ ok: boolean }>('/session/stop', { method: 'POST' }),

  disconnect: () => apiFetch<{ ok: boolean }>('/session/disconnect', { method: 'POST' }),

  hasStoredKey: () => apiFetch<{ hasStoredKey: boolean }>('/session/stored-key'),

  createLibrary: () => apiFetch<{ ok: boolean }>('/library/create', { method: 'POST' }),

  createComponent: (componentName: string) =>
    apiFetch<{ ok: boolean; componentPath: string }>('/component/create', {
      method: 'POST',
      body: JSON.stringify({ componentName }),
    }),

  startPreview: () =>
    apiFetch<{ ok: boolean; previewUrl: string }>('/preview/start', { method: 'POST' }),

  pushDev: () => apiFetch<{ ok: boolean }>('/push/dev', { method: 'POST' }),

  deploy: () => apiFetch<{ ok: boolean }>('/deploy', { method: 'POST' }),
};
