# Vibe Custom Components

A local-first builder for [Retool Custom Component Libraries](https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl).

Non-technical users can create, preview, push, and deploy Retool custom components from a local web UI — without exposing API keys to any cloud service.

---

## Architecture

```
vibe-custom-components/
  apps/
    runner/          # Local Node/TypeScript API service (port 3001)
    web/             # Local Vite + React web UI (port 5173)
  packages/
    templates/
      component/         # Starter component template (MyComponent.tsx)
      preview-harness/   # Standalone Vite preview app (port 5174)
```

- **runner** – orchestrates Retool CLI commands, manages a local workspace folder, stores your API key securely, and streams logs to the UI via SSE.
- **web** – onboarding screen (API key + org + library name), action panel (Create Library / Component / Preview / Push Dev / Deploy), live log panel, and an iframe preview area.
- **preview-harness** – a minimal Vite app that simulates the Retool Custom Component environment for local development.

---

## Prerequisites (Windows)

1. **Node.js ≥ 18** — [Download from nodejs.org](https://nodejs.org/)
   - Verify: open PowerShell and run `node --version`
2. **npm ≥ 9** (bundled with Node.js)
   - Verify: `npm --version`

> **Note:** The bundled runtime story (no Node.js required) is planned for Phase 2.

---

## Setup (Windows)

Open **PowerShell** or **Command Prompt** and run:

```powershell
# 1. Clone or download the repository
git clone https://github.com/MiguelOrtizUp/vibe-custom-components.git
cd vibe-custom-components

# 2. Install all dependencies (run once at the repo root)
npm install

# 3. Start both services
npm run dev
```

This starts:
- Runner API at **http://localhost:3001**
- Web UI at **http://localhost:5173** (opens automatically in your browser)

---

## First-time use

1. Open **http://localhost:5173** in your browser.
2. Enter:
   - **Retool API Key** — from your Retool account settings → API keys
   - **Retool Org / Domain** — e.g. `myorg.retool.com` or just `myorg`
   - **Library Name** — e.g. `my-components`
3. Click **Start Session →**

Your API key is stored securely using **Windows Credential Manager** (keytar).
If Credential Manager is unavailable, it falls back to a local config file at
`%USERPROFILE%\.vibe-custom-components\config.json` with a prominent warning.

---

## Workspace location

Component library workspaces are created under:

```
%USERPROFILE%\.vibe-custom-components\workspaces\<library-name>\
```

---

## Action buttons

| Button | What it does |
|---|---|
| **Create Library** | Runs `npx retool-ccl create <library-name>` in your workspace |
| **Create Component** | Scaffolds a React component from the starter template |
| **Start Preview** | Starts the local preview harness at http://localhost:5174 |
| **Push Dev** | Runs `npx retool-ccl publish --dev` |
| **Deploy** | Runs `npx retool-ccl publish` |

All CLI commands are logged to the **log panel** before execution. The API key is passed via environment variable and is never printed in logs.

---

## Preview Harness

The preview harness at `packages/templates/preview-harness` is a standalone Vite app
that simulates the Retool Custom Component environment (props, model state, dimensions).

To use it:

```powershell
cd packages\templates\preview-harness
npm install
npm run dev
# Opens at http://localhost:5174
```

Replace `ComponentRenderer` in `src/App.tsx` with your actual component import.

---

## API key security

| Scenario | Storage |
|---|---|
| Windows Credential Manager available | Key stored in Credential Manager (recommended) |
| Credential Manager unavailable | Key stored in `%USERPROFILE%\.vibe-custom-components\config.json` with a warning |
| `VIBE_DISABLE_FILE_SECRET=true` set | Key stored only in Credential Manager; not persisted if unavailable |

To remove the stored key, click **Disconnect & Remove Key** in the web UI, or run:

```powershell
# Remove from Credential Manager manually via Windows Settings → Credential Manager
# OR use the disconnect button in the UI
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `RUNNER_PORT` | `3001` | Port for the runner API service |
| `VIBE_DISABLE_FILE_SECRET` | (unset) | Set to `true` to disable file-based API key fallback |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start runner + web UI concurrently |
| `npm run build` | Build both apps for production |

---

## Retool CCL reference

Commands used: https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl

---

## Roadmap

- **Phase 2**: Desktop packaging (Electron/Tauri), bundled Node runtime, component list UI, build error explanations.
- **Phase 3**: Prop/event schema editor, versioning, component templates library, visual snapshots.
