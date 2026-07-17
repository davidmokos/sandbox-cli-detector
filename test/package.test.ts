import { execFileSync, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);

// Exercises the actual npm tarball: file list, CJS require, ESM import, and
// the packaged CLI. Requires `npm run build` first (the test script does it).
describe("packaged tarball", () => {
  let tmp: string;
  let pkgDir: string;
  let packedFiles: string[];
  let tarballPath: string;

  beforeAll(() => {
    tmp = mkdtempSync(join(tmpdir(), "sandbox-cli-detector-pack-"));
    // --ignore-scripts: prepack runs the test suite, which would recurse.
    const packJson = execSync(`npm pack --ignore-scripts --json --pack-destination "${tmp}"`, {
      cwd: root,
      encoding: "utf8",
    });
    const [info] = JSON.parse(packJson);
    packedFiles = info.files.map((f: { path: string }) => f.path);
    tarballPath = join(tmp, info.filename);
    execSync(`tar -xzf "${tarballPath}" -C "${tmp}"`);
    pkgDir = join(tmp, "package");
  }, 60_000);

  afterAll(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("contains the expected files", () => {
    const expected = [
      "LICENSE",
      "README.md",
      "package.json",
      "dist/index.js",
      "dist/index.cjs",
      "dist/index.d.ts",
      "dist/index.d.cts",
      "dist/cli.js",
      "dist/cli.cjs",
    ];
    for (const file of expected) {
      expect(packedFiles).toContain(file);
    }
    expect(packedFiles.some((f) => f.startsWith("src/"))).toBe(false);
    expect(packedFiles.some((f) => f.startsWith("test/"))).toBe(false);
  });

  it("works via CommonJS require", () => {
    const cjs = require(join(pkgDir, "dist/index.cjs"));
    expect(typeof cjs.detectSandbox).toBe("function");
    expect(typeof cjs.isRunningInSandbox).toBe("function");
    const result = cjs.detectSandbox({ env: { E2B_SANDBOX: "true" } });
    expect(result.sandbox.id).toBe("e2b");
  });

  it("types the CommonJS entry as CommonJS under module Node16", () => {
    const consumerDir = join(tmp, "node16-consumer");
    const rootNodeModules = join(root, "node_modules");
    mkdirSync(consumerDir);
    writeFileSync(
      join(consumerDir, "package.json"),
      JSON.stringify({ type: "commonjs", dependencies: { "sandbox-cli-detector": tarballPath } })
    );
    writeFileSync(
      join(consumerDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "Node16",
          moduleResolution: "Node16",
          strict: true,
          skipLibCheck: true,
          types: ["node"],
          typeRoots: [join(rootNodeModules, "@types")],
        },
        include: ["index.ts"],
      })
    );
    writeFileSync(
      join(consumerDir, "index.ts"),
      `const { detectSandbox } = require("sandbox-cli-detector") as typeof import("sandbox-cli-detector");
detectSandbox();
`
    );

    execSync("npm install --ignore-scripts", { cwd: consumerDir, stdio: "pipe" });
    execFileSync(join(rootNodeModules, ".bin", "tsc"), ["-p", "tsconfig.json", "--noEmit"], {
      cwd: consumerDir,
      stdio: "pipe",
    });
  });

  it("works via ESM import", async () => {
    const esm = await import(pathToFileURL(join(pkgDir, "dist/index.js")).href);
    expect(typeof esm.detectSandbox).toBe("function");
    const result = esm.detectSandbox({ env: { DAYTONA_SANDBOX_ID: "d-1" } });
    expect(result.sandbox.id).toBe("daytona");
    expect(Array.isArray(esm.defaultSandboxes)).toBe(true);
  });

  const runCli = (args: string[], env: Record<string, string>) => {
    try {
      const stdout = execFileSync(process.execPath, [join(pkgDir, "dist/cli.js"), ...args], {
        env,
        encoding: "utf8",
      });
      return { stdout, code: 0 };
    } catch (error) {
      const e = error as { status: number; stdout: string };
      return { stdout: e.stdout, code: e.status };
    }
  };

  it("CLI detects a sandbox and exits 0", () => {
    const { stdout, code } = runCli([], { E2B_SANDBOX: "true", E2B_SANDBOX_ID: "sbx_1" });
    expect(code).toBe(0);
    expect(stdout).toContain("detected: E2B (sbx_1)");
  });

  it("CLI reports JSON with --json", () => {
    const { stdout, code } = runCli(["--json"], { MODAL_SANDBOX_ID: "sb-1" });
    expect(code).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.detected).toBe(true);
    expect(result.sandbox.id).toBe("modal");
    expect(result.sandbox.instanceId).toBe("sb-1");
  });

  it("CLI exits 1 in a clean environment", () => {
    const { stdout, code } = runCli([], {});
    expect(code).toBe(1);
    expect(stdout).toContain("no sandbox detected");
  });

  it("CLI is silent with --quiet", () => {
    const { stdout, code } = runCli(["--quiet"], {});
    expect(code).toBe(1);
    expect(stdout).toBe("");
  });

  it("CLI prints help with --help and exits 0", () => {
    const { stdout, code } = runCli(["--help"], {});
    expect(code).toBe(0);
    expect(stdout).toContain("Usage: sandbox-cli-detector");
  });
});
