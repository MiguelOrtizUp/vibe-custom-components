import { Router, Request, Response } from 'express';
import { logBus } from './logBus';
import { storeApiKey, getStoredApiKey, deleteStoredApiKey } from './secrets';
import { setSession, getSession, clearSession, requireSession } from './session';
import { getWorkspace } from './workspace';
import { createLibrary, publishDev, deploy } from './retoolCli';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// GET /api/logs/stream  (SSE)
// ---------------------------------------------------------------------------
router.get('/logs/stream', (req: Request, res: Response) => {
  logBus.attachSSE(res);
  // Note: cleanup is handled inside attachSSE via res.on('close')
});

// ---------------------------------------------------------------------------
// GET /api/session
// ---------------------------------------------------------------------------
router.get('/session', (_req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.json({ active: false });
    return;
  }
  res.json({
    active: true,
    orgDomain: session.orgDomain,
    libraryName: session.libraryName,
    workspacePath: session.workspacePath,
    previewUrl: session.previewUrl ?? null,
  });
});

// ---------------------------------------------------------------------------
// POST /api/session/start
// ---------------------------------------------------------------------------
router.post('/session/start', async (req: Request, res: Response) => {
  const { apiKey, orgDomain, libraryName } = req.body as {
    apiKey?: string;
    orgDomain?: string;
    libraryName?: string;
  };

  if (!apiKey || !orgDomain || !libraryName) {
    res.status(400).json({ error: 'apiKey, orgDomain, and libraryName are required.' });
    return;
  }

  logBus.info(`[session] Starting session for org: ${orgDomain}, library: ${libraryName}`);

  // Persist the API key securely
  const { usedFallback } = await storeApiKey(apiKey);
  if (usedFallback) {
    logBus.warn(
      '[session] API key stored using file fallback (Credential Manager not available). ' +
        'See SECURITY WARNING in runner logs.'
    );
  } else {
    logBus.info('[session] API key stored securely in system credential store.');
  }

  const workspace = getWorkspace(libraryName);
  logBus.info(`[session] Workspace: ${workspace.libraryPath}`);

  setSession({
    apiKey,
    orgDomain,
    libraryName,
    workspacePath: workspace.libraryPath,
  });

  res.json({
    ok: true,
    orgDomain,
    libraryName,
    workspacePath: workspace.libraryPath,
  });
});

// ---------------------------------------------------------------------------
// POST /api/session/stop
// ---------------------------------------------------------------------------
router.post('/session/stop', async (_req: Request, res: Response) => {
  clearSession();
  logBus.info('[session] Session stopped.');
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// POST /api/session/disconnect
// Clears session AND deletes stored API key
// ---------------------------------------------------------------------------
router.post('/session/disconnect', async (_req: Request, res: Response) => {
  clearSession();
  await deleteStoredApiKey();
  logBus.info('[session] Disconnected and API key removed from storage.');
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// GET /api/session/stored-key
// Returns whether a stored key exists (not the key itself)
// ---------------------------------------------------------------------------
router.get('/session/stored-key', async (_req: Request, res: Response) => {
  const key = await getStoredApiKey();
  res.json({ hasStoredKey: key !== null });
});

// ---------------------------------------------------------------------------
// POST /api/library/create
// ---------------------------------------------------------------------------
router.post('/library/create', async (_req: Request, res: Response) => {
  try {
    const session = requireSession();
    logBus.info(`[library] Creating library "${session.libraryName}"...`);

    const result = await createLibrary(
      { apiKey: session.apiKey, orgDomain: session.orgDomain },
      session.libraryName,
      session.workspacePath
    );

    if (result.code === 0) {
      logBus.info('[library] Library created successfully.');
      res.json({ ok: true });
    } else {
      logBus.error(`[library] Create failed with code ${result.code}.`);
      res.status(500).json({ error: 'Library creation failed. Check the log panel for details.' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logBus.error(`[library] Error: ${message}`);
    res.status(400).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/component/create
// ---------------------------------------------------------------------------
router.post('/component/create', async (req: Request, res: Response) => {
  const { componentName } = req.body as { componentName?: string };

  if (!componentName) {
    res.status(400).json({ error: 'componentName is required.' });
    return;
  }

  try {
    const session = requireSession();
    logBus.info(`[component] Creating component "${componentName}" in "${session.libraryName}"...`);

    // Copy component template into workspace
    const templateDir = path.resolve(__dirname, '..', '..', '..', 'packages', 'templates', 'component');
    const destDir = path.join(session.workspacePath, 'src', 'components', componentName);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Read template files and replace placeholders
    const templateFiles = fs.readdirSync(templateDir);
    for (const file of templateFiles) {
      const src = path.join(templateDir, file);
      const destName = file.replace(/MyComponent/g, componentName);
      const dest = path.join(destDir, destName);
      let content = fs.readFileSync(src, 'utf-8');
      content = content.replace(/MyComponent/g, componentName);
      fs.writeFileSync(dest, content, 'utf-8');
      logBus.info(`[component] Created ${destName}`);
    }

    logBus.info(`[component] Component "${componentName}" scaffolded at ${destDir}`);
    res.json({ ok: true, componentPath: destDir });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logBus.error(`[component] Error: ${message}`);
    res.status(400).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/preview/start
// ---------------------------------------------------------------------------
router.post('/preview/start', async (_req: Request, res: Response) => {
  try {
    const session = requireSession();

    // The preview harness is the Vite app in packages/templates/preview-harness.
    // In a real setup this would be installed into the workspace. For Phase 1 we
    // serve the harness directly from packages/templates/preview-harness.
    const harnessDir = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'packages',
      'templates',
      'preview-harness'
    );

    const previewUrl = `http://localhost:5174`;
    session.previewUrl = previewUrl;

    logBus.info(`[preview] Preview harness would start at ${previewUrl}`);
    logBus.info(`[preview] Command: npx vite --port 5174 (cwd: ${harnessDir})`);
    logBus.info(
      '[preview] Note: In Phase 1, start the preview manually with: cd packages/templates/preview-harness && npx vite'
    );

    res.json({ ok: true, previewUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logBus.error(`[preview] Error: ${message}`);
    res.status(400).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/push/dev
// ---------------------------------------------------------------------------
router.post('/push/dev', async (_req: Request, res: Response) => {
  try {
    const session = requireSession();
    logBus.info(`[push-dev] Publishing to dev channel for library "${session.libraryName}"...`);

    const result = await publishDev(
      { apiKey: session.apiKey, orgDomain: session.orgDomain },
      session.workspacePath
    );

    if (result.code === 0) {
      logBus.info('[push-dev] Published to dev channel successfully.');
      res.json({ ok: true });
    } else {
      logBus.error(`[push-dev] Failed with code ${result.code}.`);
      res.status(500).json({ error: 'Push dev failed. Check the log panel for details.' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logBus.error(`[push-dev] Error: ${message}`);
    res.status(400).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/deploy
// ---------------------------------------------------------------------------
router.post('/deploy', async (_req: Request, res: Response) => {
  try {
    const session = requireSession();
    logBus.info(`[deploy] Deploying library "${session.libraryName}" to production...`);

    const result = await deploy(
      { apiKey: session.apiKey, orgDomain: session.orgDomain },
      session.workspacePath
    );

    if (result.code === 0) {
      logBus.info('[deploy] Library deployed successfully.');
      res.json({ ok: true });
    } else {
      logBus.error(`[deploy] Failed with code ${result.code}.`);
      res.status(500).json({ error: 'Deploy failed. Check the log panel for details.' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logBus.error(`[deploy] Error: ${message}`);
    res.status(400).json({ error: message });
  }
});

export default router;
