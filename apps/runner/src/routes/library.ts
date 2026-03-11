import { Router, Request, Response } from 'express';
import { createLibrary } from '../services/retool-cli';
import { ensureWorkspace } from '../services/workspace';
import { getSession } from '../services/session-store';

const router = Router();

/** Create a new Retool Custom Component Library via the CLI. */
router.post('/create', async (_req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.status(401).json({ error: 'No active session. Please start a session first.' });
    return;
  }

  ensureWorkspace(session.libraryName);
  const result = await createLibrary();
  res.json({ ok: result.exitCode === 0, log: result.output });
});

export default router;
