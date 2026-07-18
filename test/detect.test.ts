import { describe, expect, it } from "vitest";
import { defaultSandboxes, detectSandbox, isRunningInSandbox } from "../src/index.js";

describe("detectSandbox", () => {
  it("returns a minimal result for a clean environment", () => {
    expect(detectSandbox({ env: { PATH: "/usr/bin", HOME: "/home/user" } })).toEqual({
      detected: false,
    });
  });

  it("returns only the sandbox identity", () => {
    expect(
      detectSandbox({ env: { E2B_SANDBOX: "true", E2B_SANDBOX_ID: "sbx_123" } }),
    ).toEqual({
      detected: true,
      sandbox: { id: "e2b", name: "E2B" },
    });
  });

  it("requires exact values when a signal defines one", () => {
    expect(detectSandbox({ env: { E2B_SANDBOX: "false" } })).toEqual({ detected: false });
    expect(detectSandbox({ env: { CSB: "false" } })).toEqual({ detected: false });
  });

  it("treats empty values as unset", () => {
    expect(detectSandbox({ env: { DAYTONA_SANDBOX_ID: "" } })).toEqual({ detected: false });
  });

  it.each([
    ["bolt", { BOLT_ENV: "production" }],
    ["rork", { RORK_API_URL: "https://api.rork.com" }],
    ["vercel-sandbox", { HOME: "/home/vercel-sandbox" }],
    ["daytona", { DAYTONA_SANDBOX_ID: "daytona-1" }],
    ["modal", { MODAL_SANDBOX_ID: "modal-1" }],
    ["modal", { MODAL_TASK_ID: "task-1" }],
    ["cloudflare-sandbox", { CLOUDFLARE_DURABLE_OBJECT_ID: "object-1" }],
    ["codespaces", { CODESPACES: "true" }],
    ["codesandbox", { CSB: "true" }],
    ["codesandbox", { CSB_SANDBOX_ID: "csb-1" }],
  ])("detects %s", (id, env) => {
    expect(detectSandbox({ env }).sandbox?.id).toBe(id);
  });

  it("reports the first matching sandbox", () => {
    const result = detectSandbox({
      env: { RORK_API_URL: "https://api.rork.com", E2B_SANDBOX: "true" },
    });

    expect(result).toEqual({
      detected: true,
      sandbox: { id: "rork", name: "Rork" },
    });
  });

  it("reports Replit environments as E2B only when the E2B marker is present", () => {
    expect(detectSandbox({ env: { REPLIT_SESSION: "session-1" } })).toEqual({ detected: false });
    expect(
      detectSandbox({ env: { REPLIT_SESSION: "session-1", E2B_SANDBOX: "true" } }),
    ).toEqual({
      detected: true,
      sandbox: { id: "e2b", name: "E2B" },
    });
  });

  it("supports custom sandbox definitions", () => {
    const result = detectSandbox({
      env: { MY_SANDBOX: "yes" },
      sandboxes: [
        {
          id: "my-sandbox",
          name: "My Sandbox",
          env: [{ name: "MY_SANDBOX", value: "yes" }],
        },
      ],
    });

    expect(result.sandbox).toEqual({ id: "my-sandbox", name: "My Sandbox" });
  });
});

describe("isRunningInSandbox", () => {
  it("returns the detection boolean", () => {
    expect(isRunningInSandbox({ env: {} })).toBe(false);
    expect(isRunningInSandbox({ env: { CODESPACES: "true" } })).toBe(true);
  });
});

describe("defaultSandboxes", () => {
  it("has unique ids", () => {
    const ids = defaultSandboxes.map((sandbox) => sandbox.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
