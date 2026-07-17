#!/usr/bin/env node
import { detectSandbox } from "./index.js";

const args = new Set(process.argv.slice(2));

if (args.has("-h") || args.has("--help")) {
  console.log(`Usage: sandbox-cli-detector [options]

Detect whether this process runs inside a sandboxed environment.

Options:
  --json    Print the full detection result as JSON
  --quiet   No output, exit code only
  -h, --help  Show this help

Exit codes:
  0  sandbox detected
  1  no sandbox detected`);
  process.exit(0);
}

const result = detectSandbox();

if (!args.has("--quiet")) {
  if (args.has("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.sandbox) {
    const id = result.sandbox.instanceId ? ` (${result.sandbox.instanceId})` : "";
    console.log(`detected: ${result.sandbox.name}${id}`);
    for (const match of result.matches.slice(1)) {
      console.log(`also matched: ${match.name}`);
    }
  } else {
    console.log("no sandbox detected");
  }
}

process.exitCode = result.detected ? 0 : 1;
