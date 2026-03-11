import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { getSession } from '../services/session-store';
import { ensureWorkspace } from '../services/workspace';

const router = Router();

/**
 * Resolve the templates directory.
 * Can be overridden via the TEMPLATES_DIR environment variable for flexibility
 * (e.g. when running tests or from a different working directory).
 * Default: walk up from this file's location to the monorepo root, then into
 * packages/templates/component.
 */
function getTemplateDir(): string {
  if (process.env.TEMPLATES_DIR) {
    return process.env.TEMPLATES_DIR;
  }
  // __dirname is either:
  //   <root>/apps/runner/src/routes   (ts-node / ts-node-dev)
  //   <root>/apps/runner/dist/routes  (compiled JS)
  // In both cases, 4 levels up reaches the monorepo root.
  return path.resolve(__dirname, '..', '..', '..', '..', 'packages', 'templates', 'component');
}

/** Scaffold a new component in the workspace from the built-in template. */
router.post('/create', (req: Request, res: Response) => {
  const session = getSession();
  if (!session) {
    res.status(401).json({ error: 'No active session.' });
    return;
  }

  const { name } = req.body as { name?: string };
  const componentName = name ?? 'MyComponent';

  const workspaceDir = ensureWorkspace(session.libraryName);
  const componentDir = path.join(workspaceDir, 'src', componentName);
  fs.mkdirSync(componentDir, { recursive: true });

  // Copy template files into the component directory
  const TEMPLATE_DIR = getTemplateDir();
  const files = fs.existsSync(TEMPLATE_DIR) ? fs.readdirSync(TEMPLATE_DIR) : [];
  for (const file of files) {
    const src = path.join(TEMPLATE_DIR, file);
    const dest = path.join(componentDir, file.replace('MyComponent', componentName));
    let content = fs.readFileSync(src, 'utf8');
    content = content.replace(/MyComponent/g, componentName);
    fs.writeFileSync(dest, content, 'utf8');
  }

  res.json({
    ok: true,
    componentName,
    path: componentDir,
    files: files.map((f) => f.replace('MyComponent', componentName)),
  });
});

export default router;
