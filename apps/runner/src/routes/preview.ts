import { Router, Request, Response } from 'express';
import { getSession } from '../services/session-store';
import { getWorkspaceDir } from '../services/workspace';
import { pushDev, deploy } from '../services/retool-cli';

const router = Router();

/**
 * Returns the URL of the Vite preview server.
 * Phase 1: returns a stub URL. Phase 2: spawn Vite and return the real dev URL.
 */
router.post('/start', (_req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.status(401).json({ error: 'No active session.' });
    return;
  }
  res.json({
    ok: true,
    previewUrl: 'http://localhost:5174',
    message: '[stub] Preview server would start here. Wire in Vite in Phase 2.',
  });
});

/** Push to Retool (dev mode). */
router.post('/push-dev', async (_req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.status(401).json({ error: 'No active session.' });
    return;
  }
  const result = await pushDev(getWorkspaceDir(session.libraryName));
  res.json({ ok: result.exitCode === 0, log: result.output });
});

/** Deploy (publish) to Retool Cloud. */
router.post('/deploy', async (_req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.status(401).json({ error: 'No active session.' });
    return;
  }
  const result = await deploy(getWorkspaceDir(session.libraryName));
  res.json({ ok: result.exitCode === 0, log: result.output });
});

export default router;
