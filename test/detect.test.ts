import { describe, expect, it } from "vitest";
import { defaultSandboxes, detectSandbox, isRunningInSandbox } from "../src/index.js";

describe("detectSandbox", () => {
  it("detects nothing in a clean environment", () => {
    const result = detectSandbox({ env: { PATH: "/usr/bin", HOME: "/home/user" } });
    expect(result.detected).toBe(false);
    expect(result.sandbox).toBeNull();
    expect(result.matches).toEqual([]);
  });

  it("detects E2B via E2B_SANDBOX=true and picks up the sandbox id", () => {
    const result = detectSandbox({
      env: { E2B_SANDBOX: "true", E2B_SANDBOX_ID: "sbx_123" },
    });
    expect(result.detected).toBe(true);
    expect(result.sandbox?.id).toBe("e2b");
    expect(result.sandbox?.instanceId).toBe("sbx_123");
    expect(result.sandbox?.evidence).toEqual([{ envVar: "E2B_SANDBOX", value: "true" }]);
  });

  it("does not detect E2B when the value differs", () => {
    const result = detectSandbox({ env: { E2B_SANDBOX: "false" } });
    expect(result.detected).toBe(false);
  });

  it("detects existence-only matchers regardless of value", () => {
    const result = detectSandbox({ env: { DAYTONA_SANDBOX_ID: "abc" } });
    expect(result.sandbox?.id).toBe("daytona");
    expect(result.sandbox?.instanceId).toBe("abc");
  });

  it("treats an empty string as unset", () => {
    const result = detectSandbox({ env: { DAYTONA_SANDBOX_ID: "" } });
    expect(result.detected).toBe(false);
  });

  it("detects Replit via any of its markers", () => {
    expect(detectSandbox({ env: { REPLIT_SESSION: "sess-1" } }).sandbox?.id).toBe("replit");
    expect(detectSandbox({ env: { REPLIT_CONTAINER: "c-1" } }).sandbox?.id).toBe("replit");
    expect(detectSandbox({ env: { REPLIT_USER: "david" } }).sandbox?.id).toBe("replit");
  });

  it("detects bolt.new via any BOLT_* marker", () => {
    expect(detectSandbox({ env: { BOLT_ENV: "production" } }).sandbox?.id).toBe("bolt");
    expect(detectSandbox({ env: { BOLT_ORIGIN: "https://bolt.new" } }).sandbox?.id).toBe("bolt");
    expect(detectSandbox({ env: { BOLT_SERVER_URL: "https://x" } }).sandbox?.id).toBe("bolt");
  });

  it("detects Vercel Sandbox via its HOME directory", () => {
    const result = detectSandbox({ env: { HOME: "/home/vercel-sandbox" } });
    expect(result.sandbox?.id).toBe("vercel-sandbox");

    const noMatch = detectSandbox({ env: { HOME: "/home/user" } });
    expect(noMatch.detected).toBe(false);
  });

  it("detects Modal via MODAL_SANDBOX_ID or MODAL_TASK_ID", () => {
    expect(detectSandbox({ env: { MODAL_SANDBOX_ID: "sb-1" } }).sandbox?.id).toBe("modal");
    expect(detectSandbox({ env: { MODAL_TASK_ID: "ta-1" } }).sandbox?.id).toBe("modal");
  });

  it("detects Cloudflare Sandbox via CLOUDFLARE_DURABLE_OBJECT_ID", () => {
    const result = detectSandbox({ env: { CLOUDFLARE_DURABLE_OBJECT_ID: "do-1" } });
    expect(result.sandbox?.id).toBe("cloudflare-sandbox");
    expect(result.sandbox?.instanceId).toBe("do-1");
  });

  it("requires every condition in an AND group", () => {
    const result = detectSandbox({ env: { SHELL: "/bin/jsh" } });
    expect(result.sandbox?.id).toBe("stackblitz");

    const noMatch = detectSandbox({ env: { SHELL: "/bin/zsh" } });
    expect(noMatch.detected).toBe(false);
  });

  it("reports all matches, most specific first", () => {
    const result = detectSandbox({
      env: { REPLIT_SESSION: "sess-1", MODAL_TASK_ID: "ta-1" },
    });
    expect(result.sandbox?.id).toBe("replit");
    expect(result.matches.map((m) => m.id)).toEqual(["replit", "modal"]);
  });

  it("reports Rork as primary when running on E2B", () => {
    const result = detectSandbox({
      env: { RORK_API_URL: "https://api.rork.com", E2B_SANDBOX: "true", E2B_SANDBOX_ID: "sbx_1" },
    });
    expect(result.sandbox?.id).toBe("rork");
    expect(result.matches.map((m) => m.id)).toEqual(["rork", "e2b"]);
    expect(result.matches[1]?.instanceId).toBe("sbx_1");
  });

  it("never matches definitions with no known markers", () => {
    const pending = defaultSandboxes.filter((s) => s.env.length === 0);
    expect(pending.length).toBeGreaterThan(0);
    const env = { LOVABLE: "true", V0: "1", VERCEL: "1" };
    const result = detectSandbox({ env });
    for (const match of result.matches) {
      expect(pending.map((s) => s.id)).not.toContain(match.id);
    }
  });

  it("supports custom sandbox definitions", () => {
    const result = detectSandbox({
      env: { MY_SANDBOX: "yes" },
      sandboxes: [
        {
          id: "my-sandbox",
          name: "My Sandbox",
          category: "ai-sandbox",
          env: [{ name: "MY_SANDBOX" }],
          verified: true,
        },
      ],
    });
    expect(result.sandbox?.id).toBe("my-sandbox");
  });
});

describe("isRunningInSandbox", () => {
  it("returns a boolean", () => {
    expect(isRunningInSandbox({ env: {} })).toBe(false);
    expect(isRunningInSandbox({ env: { CODESPACES: "true" } })).toBe(true);
  });
});

describe("defaultSandboxes", () => {
  it("has unique ids", () => {
    const ids = defaultSandboxes.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
