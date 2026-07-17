import type { SandboxDefinition } from "./types.js";

/**
 * Built-in sandbox definitions.
 *
 * Ordered by specificity: app builders first (they often run on top of the
 * generic AI sandboxes below), then AI code-execution sandboxes, then cloud
 * development environments. Detection returns the first match as the primary
 * result but reports all matches.
 *
 * Only environments whose markers were confirmed by probing the real
 * platform are listed — no guessed or documentation-only markers.
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
    id: "codesandbox",
    name: "CodeSandbox",
    category: "cloud-ide",
    env: [{ name: "CSB", value: "true" }, { name: "CSB_SANDBOX_ID" }],
    idEnv: ["CSB_SANDBOX_ID"],
    verified: true,
  },
];
