const BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}

export const api = {
  startSession: (data: { apiKey: string; retoolOrg: string; libraryName: string }) =>
    post<{ ok: boolean; verificationLog: string }>('/session/start', data),

  sessionStatus: () => get<{ active: boolean; retoolOrg?: string; libraryName?: string }>('/session/status'),

  logout: () => post<{ ok: boolean }>('/session/logout', {}),

  createLibrary: () => post<{ ok: boolean; log: string }>('/library/create', {}),

  createComponent: (name: string) =>
    post<{ ok: boolean; componentName: string; path: string; files: string[] }>('/component/create', { name }),

  startPreview: () => post<{ ok: boolean; previewUrl: string; message: string }>('/preview/start', {}),

  pushDev: () => post<{ ok: boolean; log: string }>('/preview/push-dev', {}),

  deploy: () => post<{ ok: boolean; log: string }>('/preview/deploy', {}),

  sendChatMessage: (messages: { role: string; content: string }[]) =>
    post<{ reply: string; isStub: boolean }>('/chat/message', { messages }),
};
