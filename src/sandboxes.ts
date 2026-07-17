import type { SandboxDefinition } from "./types.js";

/**
 * Built-in sandbox definitions.
 *
 * Ordered by specificity: app builders first (they often run on top of the
 * generic AI sandboxes below), then AI code-execution sandboxes, then cloud
 * development environments. Detection returns the first match as the primary
 * result but reports all matches.
 *
 * `verified: false` means the env markers are a best guess or entirely
 * unknown (`env: []`) — these still need to be confirmed by running inside
 * the real platform.
 */
export const defaultSandboxes: readonly SandboxDefinition[] = [
  // ── AI app builders ────────────────────────────────────────────────────
  // Lovable, v0, and Base44 are intentionally absent: they expose no shell,
  // so a CLI can never run inside them.
  {
    id: "replit",
    name: "Replit",
    category: "app-builder",
    // Observed inside Replit. The often-cited REPL_ID and REPLIT_ENVIRONMENT
    // are NOT present in current Replit environments.
    env: [{ name: "REPLIT_SESSION" }, { name: "REPLIT_CONTAINER" }, { name: "REPLIT_USER" }],
    verified: true,
  },
  {
    id: "bolt",
    name: "bolt.new",
    category: "app-builder",
    env: [{ name: "BOLT_ENV" }, { name: "BOLT_ORIGIN" }, { name: "BOLT_SERVER_URL" }],
    verified: true,
  },
  {
    id: "rork",
    name: "Rork",
    category: "app-builder",
    // Rork runs on E2B, so e2b also appears in matches.
    env: [{ name: "RORK_API_URL" }],
    verified: true,
  },

  // ── AI code-execution sandboxes ────────────────────────────────────────
  {
    id: "e2b",
    name: "E2B",
    category: "ai-sandbox",
    // Documented: https://e2b.dev/docs/sandbox/environment-variables
    env: [{ name: "E2B_SANDBOX", value: "true" }],
    idEnv: ["E2B_SANDBOX_ID"],
    verified: true,
  },
  {
    id: "vercel-sandbox",
    name: "Vercel Sandbox",
    category: "ai-sandbox",
    // No dedicated marker; the microVMs run as the vercel-sandbox user.
    // (PS1="▲ $PWD/" is also set, but only in interactive shells.)
    env: [{ name: "HOME", value: "/home/vercel-sandbox" }],
    verified: true,
  },
  {
    id: "daytona",
    name: "Daytona",
    category: "ai-sandbox",
    env: [{ name: "DAYTONA_SANDBOX_ID" }],
    idEnv: ["DAYTONA_SANDBOX_ID"],
    verified: true,
  },
  {
    id: "modal",
    name: "Modal",
    category: "ai-sandbox",
    // MODAL_SANDBOX_ID observed in Modal Sandboxes; MODAL_TASK_ID is the
    // documented container id (https://modal.com/docs/guide/environment_variables).
    env: [{ name: "MODAL_SANDBOX_ID" }, { name: "MODAL_TASK_ID" }],
    idEnv: ["MODAL_SANDBOX_ID", "MODAL_TASK_ID"],
    verified: true,
  },
  {
    id: "cloudflare-sandbox",
    name: "Cloudflare Sandbox",
    category: "ai-sandbox",
    env: [{ name: "CLOUDFLARE_DURABLE_OBJECT_ID" }],
    idEnv: ["CLOUDFLARE_DURABLE_OBJECT_ID"],
    verified: true,
  },
  {
    id: "morph",
    name: "Morph Cloud",
    category: "ai-sandbox",
    // TODO: unknown — needs a probe inside a Morph instance.
    env: [],
    verified: false,
  },
  {
    id: "runloop",
    name: "Runloop",
    category: "ai-sandbox",
    // TODO: unknown — needs a probe inside a Runloop devbox.
    env: [],
    verified: false,
  },
  {
    id: "fly",
    name: "Fly.io Machine",
    category: "ai-sandbox",
    // Fly Machines runtime env: https://fly.io/docs/machines/runtime-environment/
    env: [{ name: "FLY_MACHINE_ID" }, { name: "FLY_ALLOC_ID" }],
    idEnv: ["FLY_MACHINE_ID", "FLY_ALLOC_ID"],
    verified: false,
  },

  // ── Cloud development environments ─────────────────────────────────────
  {
    id: "codespaces",
    name: "GitHub Codespaces",
    category: "cloud-ide",
    env: [{ name: "CODESPACES", value: "true" }],
    idEnv: ["CODESPACE_NAME"],
    verified: true,
  },
  {
    id: "gitpod",
    name: "Gitpod",
    category: "cloud-ide",
    env: [{ name: "GITPOD_WORKSPACE_ID" }],
    idEnv: ["GITPOD_WORKSPACE_ID"],
    verified: false,
  },
  {
    id: "codesandbox",
    name: "CodeSandbox",
    category: "cloud-ide",
    // TODO: confirm — CSB is believed to be set in CodeSandbox microVMs.
    env: [{ name: "CSB" }, { name: "CODESANDBOX_HOST" }],
    verified: false,
  },
  {
    id: "stackblitz",
    name: "StackBlitz WebContainer",
    category: "cloud-ide",
    // TODO: confirm — WebContainers use the jsh shell; no dedicated marker known.
    env: [[{ name: "SHELL", value: "/bin/jsh" }]],
    verified: false,
  },
  {
    id: "cloud-shell",
    name: "Google Cloud Shell",
    category: "cloud-ide",
    env: [{ name: "CLOUD_SHELL", value: "true" }],
    verified: false,
  },
  {
    id: "coder",
    name: "Coder",
    category: "cloud-ide",
    // TODO: confirm — Coder agents export CODER_WORKSPACE_NAME and friends.
    env: [{ name: "CODER_WORKSPACE_NAME" }],
    idEnv: ["CODER_WORKSPACE_NAME"],
    verified: false,
  },
];
