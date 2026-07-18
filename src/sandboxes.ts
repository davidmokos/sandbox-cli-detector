import type { SandboxDefinition } from "./types.js";

export const defaultSandboxes = [
  {
    id: "bolt",
    name: "bolt.new",
    env: [{ name: "BOLT_ENV" }, { name: "BOLT_ORIGIN" }, { name: "BOLT_SERVER_URL" }],
  },
  {
    id: "rork",
    name: "Rork",
    env: [{ name: "RORK_API_URL" }],
  },
  {
    id: "e2b",
    name: "E2B",
    env: [{ name: "E2B_SANDBOX", value: "true" }],
  },
  {
    id: "vercel-sandbox",
    name: "Vercel Sandbox",
    env: [{ name: "HOME", value: "/home/vercel-sandbox" }],
  },
  {
    id: "daytona",
    name: "Daytona",
    env: [{ name: "DAYTONA_SANDBOX_ID" }],
  },
  {
    id: "modal",
    name: "Modal",
    env: [{ name: "MODAL_SANDBOX_ID" }, { name: "MODAL_TASK_ID" }],
  },
  {
    id: "cloudflare-sandbox",
    name: "Cloudflare Sandbox",
    env: [{ name: "CLOUDFLARE_DURABLE_OBJECT_ID" }],
  },
  {
    id: "codespaces",
    name: "GitHub Codespaces",
    env: [{ name: "CODESPACES", value: "true" }],
  },
  {
    id: "codesandbox",
    name: "CodeSandbox",
    env: [{ name: "CSB", value: "true" }, { name: "CSB_SANDBOX_ID" }],
  },
] satisfies readonly SandboxDefinition[];
