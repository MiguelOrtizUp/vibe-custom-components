# Vibe Custom Components

A local-first platform for building, previewing, and deploying **Retool Custom Component Libraries** — with a chat-driven interface powered by an LLM agent (Phase 2+).

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/) (install on your Windows PC first)
- [Git](https://git-scm.com/download/win) (to clone the repo)
- A [Retool Cloud](https://retool.com/) account with an API key

---

## Getting Started (Windows)

### 1. Download / clone the repository to your PC

Open **PowerShell** or **Command Prompt** and run:

```powershell
git clone https://github.com/MiguelOrtizUp/vibe-custom-components.git
cd vibe-custom-components
```

> **Important:** All `npm` commands must be run from inside the cloned `vibe-custom-components` folder on your local PC. Do not run them before cloning.

### 2. Install dependencies

```powershell
npm install
```

This installs packages for both `apps/web` (the browser UI) and `apps/runner` (the local backend).

### 3. Start the platform

```powershell
npm run dev
```

This starts two local servers:

| Service | URL |
|---------|-----|
| Web UI  | <http://localhost:5173> |
| Runner (backend) | <http://localhost:3001> |

Open <http://localhost:5173> in your browser.

---

## Onboarding

When you first open the UI you will see the **Onboarding** screen. Enter:

| Field | Description |
|-------|-------------|
| **Retool API Key** | Found in your Retool account settings. Stored securely in Windows Credential Manager. |
| **Organization / Subdomain** | The `acme` part of `acme.retool.com`. |
| **Library Name** | A short identifier for your component library, e.g. `my-components`. |

Click **Connect**. The runner verifies your settings and creates a local workspace at:

```
%USERPROFILE%\.vibe-custom-components\workspaces\<library-name>\
```

---

## Chat Panel (left side)

The **Chat Panel** on the left lets you describe the React component you want to build in plain English.

**Example messages:**
- *"Create a badge component that accepts a label string and a colour."*
- *"Build a progress bar that goes from 0 to 100."*
- *"Make a date picker that returns an ISO date string."*

### Phase 1 behaviour (current)

In Phase 1 the chat panel is connected to a **stub LLM endpoint**. The assistant will echo your message and explain what the future agent will do.

### Future LLM agent workflow (Phase 2+)

1. You describe the component in the chat panel.
2. Your message (and conversation history) is sent to a configurable LLM endpoint (OpenAI, Anthropic, Azure OpenAI — set via environment variables).
3. The LLM returns a structured plan with component name, props, and behaviour.
4. The runner scaffolds the component files in your workspace.
5. The preview server hot-reloads so you can see the component immediately.
6. You iterate by sending follow-up messages in the chat panel.

To connect a real LLM when you're ready, edit `apps/runner/src/services/llm.ts` and replace the stub `callLlm` function with an API call. Add the relevant API key as an environment variable (e.g. `OPENAI_API_KEY`).

---

## Action Buttons (right side)

| Button | What it does |
|--------|-------------|
| **Create Library** | Runs `npx retool-ccl create <library>` to register the library in Retool Cloud. |
| **Create Component** | Scaffolds a new React component in your workspace from the built-in template. |
| **Start Preview** | Launches a Vite dev server and shows the component in the center panel. |
| **Push Dev** | Runs `npx retool-ccl dev` to push the current state to Retool (dev mode). |
| **Deploy** | Runs `npx retool-ccl publish` to publish the library to Retool Cloud. |

> In Phase 1 all CLI commands are **stubbed** — they log the exact command that *would* run. Wire in the real Retool CLI in a later phase.

---

## Workspace layout

Generated component files live at:

```
%USERPROFILE%\.vibe-custom-components\workspaces\<library-name>\
  src\
    <ComponentName>\
      <ComponentName>.tsx   ← your component source
      index.ts              ← re-export
```

---

## Project structure

```
vibe-custom-components/
  apps/
    web/          # Vite + React browser UI (port 5173)
    runner/       # Node + Express local backend (port 3001)
  packages/
    templates/    # Component starter templates
  README.md
  package.json    # npm workspaces root
```

---

## Security notes

- Your Retool API key is stored in **Windows Credential Manager** via `keytar` when available. It is never written to disk in plain text and never logged.
- If `keytar` is unavailable (e.g. on Linux/macOS in CI), the key is kept in process memory only and you will need to re-enter it each session.
- Never commit your API key to source control.

---

## Retool CLI reference

Full documentation: <https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl>

Key commands (run inside your workspace directory):

```powershell
npx retool-ccl create <library-name>   # Create a new library
npx retool-ccl dev                     # Push to Retool (dev mode, hot reload)
npx retool-ccl publish                 # Publish / deploy to Retool Cloud
```
