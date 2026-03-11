import { Router, Request, Response } from 'express';
import { setSession, getSession, clearSession } from '../services/session-store';
import { saveApiKey, loadApiKey, deleteApiKey } from '../services/key-store';
import { verifyApiKey } from '../services/retool-cli';

const router = Router();

/** Start (or restore) a session. Persists the API key via keytar when available. */
router.post('/start', async (req: Request, res: Response) => {
  const { apiKey, retoolOrg, libraryName } = req.body as {
    apiKey?: string;
    retoolOrg?: string;
    libraryName?: string;
  };

  if (!apiKey || !retoolOrg || !libraryName) {
    res.status(400).json({ error: 'apiKey, retoolOrg and libraryName are required.' });
    return;
  }

  setSession({ apiKey, retoolOrg, libraryName, createdAt: new Date() });

  try {
    await saveApiKey(apiKey);
  } catch {
    // non-fatal – in-memory session is still valid
  }

  const verification = await verifyApiKey();
  res.json({
    ok: true,
    retoolOrg,
    libraryName,
    verificationLog: verification.output,
  });
});

/** Return current session status (without exposing the API key). */
router.get('/status', (_req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.json({ active: false });
    return;
  }
  res.json({
    active: true,
    retoolOrg: session.retoolOrg,
    libraryName: session.libraryName,
    createdAt: session.createdAt,
  });
});

/** Restore a previously saved API key from secure storage. */
router.post('/restore', async (_req: Request, res: Response) => {
  const apiKey = await loadApiKey();
  if (!apiKey) {
    res.json({ restored: false, message: 'No saved key found.' });
    return;
  }
  res.json({ restored: true });
});

/** Clear the session and delete the persisted key. */
router.post('/logout', async (_req: Request, res: Response) => {
  clearSession();
  try {
    await deleteApiKey();
  } catch {
    // non-fatal
  }
  res.json({ ok: true });
});

export default router;
