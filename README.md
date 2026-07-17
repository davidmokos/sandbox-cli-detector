# sandbox-cli-detector

Detect whether the current process is running inside a sandboxed developer
environment.

This is useful for CLIs, SDKs, test runners, and install scripts that need to
adjust behavior inside AI sandboxes, AI app builders, and cloud IDEs.

Inspired by [ci-info](https://github.com/watson/ci-info) and built as a
companion to [agent-cli-detector](https://github.com/davidmokos/detect-agent):
`agent-cli-detector` tells you which agent is driving your CLI;
`sandbox-cli-detector` tells you where that CLI is running.

Please open an issue if a sandbox is missing or incorrectly detected.

## Installation

```sh
npm install sandbox-cli-detector
```

## Usage

```ts
import { detectSandbox, isRunningInSandbox } from "sandbox-cli-detector";

if (isRunningInSandbox()) {
  // Skip interactive prompts, tune telemetry, relax auth flows, etc.
}

const result = detectSandbox();

if (result.detected) {
  console.log("sandbox:", result.sandbox?.name);
} else {
  console.log("not running in a known sandbox");
}
```

Example result:

```json
{
  "detected": true,
  "sandbox": {
    "id": "e2b",
    "name": "E2B",
    "category": "ai-sandbox",
    "instanceId": "sbx_abc123",
    "evidence": [{ "envVar": "E2B_SANDBOX", "value": "true" }]
  },
  "matches": [
    {
      "id": "e2b",
      "name": "E2B",
      "category": "ai-sandbox",
      "instanceId": "sbx_abc123",
      "evidence": [{ "envVar": "E2B_SANDBOX", "value": "true" }]
    }
  ]
}
```

Layered environments are common. For example, an app builder may run user code
inside a generic AI sandbox. `result.sandbox` is the primary match and
`result.matches` contains every matched environment in definition order. The
built-in definitions are ordered from most specific to least specific:
app builders, then AI code-execution sandboxes, then cloud IDEs.

Use `result.sandbox.id` for stable checks. `result.sandbox.name` is display text
and may change.

## CLI

```sh
npx sandbox-cli-detector
# detected: E2B (sbx_abc123)
# no sandbox detected

npx sandbox-cli-detector --json
# prints the full DetectionResult as JSON

npx sandbox-cli-detector --quiet
# no output, exit code only
```

Exit codes:

| Code | Meaning |
| --- | --- |
| `0` | a known sandbox was detected |
| `1` | no known sandbox was detected |

## Supported environments

Detection currently uses environment variables only. Every built-in marker was
confirmed by probing the real platform; guessed or documentation-only markers
are intentionally not included.

| Name | Category | Stable id | Detection env vars | Instance id |
| --- | --- | --- | --- | --- |
| [Replit](https://replit.com) | app builder | `replit` | `REPLIT_SESSION`, `REPLIT_CONTAINER`, or `REPLIT_USER` | - |
| [bolt.new](https://bolt.new) | app builder | `bolt` | `BOLT_ENV`, `BOLT_ORIGIN`, or `BOLT_SERVER_URL` | - |
| [Rork](https://rork.com) | app builder | `rork` | `RORK_API_URL` | - |
| [E2B](https://e2b.dev) | AI sandbox | `e2b` | `E2B_SANDBOX=true` | `E2B_SANDBOX_ID` |
| [Vercel Sandbox](https://vercel.com/docs/sandbox) | AI sandbox | `vercel-sandbox` | `HOME=/home/vercel-sandbox` | - |
| [Daytona](https://daytona.io) | AI sandbox | `daytona` | `DAYTONA_SANDBOX_ID` | `DAYTONA_SANDBOX_ID` |
| [Modal](https://modal.com) | AI sandbox | `modal` | `MODAL_SANDBOX_ID` or `MODAL_TASK_ID` | `MODAL_SANDBOX_ID`, `MODAL_TASK_ID` |
| [Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/) | AI sandbox | `cloudflare-sandbox` | `CLOUDFLARE_DURABLE_OBJECT_ID` | `CLOUDFLARE_DURABLE_OBJECT_ID` |
| [GitHub Codespaces](https://github.com/features/codespaces) | cloud IDE | `codespaces` | `CODESPACES=true` | `CODESPACE_NAME` |
| [CodeSandbox](https://codesandbox.io) | cloud IDE | `codesandbox` | `CSB=true` or `CSB_SANDBOX_ID` | `CSB_SANDBOX_ID` |

Notes:

- Rork currently runs on E2B, so `detectSandbox()` can report both `rork` and
  `e2b` in `matches`.
- Lovable, v0, and Base44 are intentionally absent because they do not expose a
  shell where a CLI can run.
- Some platforms do not provide a dedicated marker. Vercel Sandbox is detected
  by its sandbox user home directory.

## API

### `detectSandbox(options?)`

Returns a `DetectionResult`.

```ts
interface DetectionResult {
  detected: boolean;
  sandbox: DetectedSandbox | null;
  matches: DetectedSandbox[];
}
```

`sandbox` is the primary match. `matches` includes all matches, in definition
order.

```ts
interface DetectedSandbox {
  id: string;
  name: string;
  category: "ai-sandbox" | "app-builder" | "cloud-ide";
  instanceId?: string;
  evidence: DetectionEvidence[];
}

interface DetectionEvidence {
  envVar: string;
  value: string;
}
```

`evidence` contains the environment variables that caused a match. Treat the
values as runtime metadata and avoid logging them unless you are comfortable
with exposing your environment.

Options:

```ts
interface DetectSandboxOptions {
  env?: Record<string, string | undefined>;
  sandboxes?: readonly SandboxDefinition[];
  strategies?: readonly DetectionStrategy[];
}
```

- `env` defaults to `process.env`.
- `sandboxes` defaults to the built-in `defaultSandboxes` list.
- `strategies` defaults to environment-variable detection.

### `isRunningInSandbox(options?)`

Returns `true` when `detectSandbox(options).detected` is `true`.

```ts
if (isRunningInSandbox()) {
  // running in a known sandbox
}
```

### `defaultSandboxes`

The built-in `SandboxDefinition[]`, exported so you can extend, filter, or
replace the supported environment list.

```ts
import { defaultSandboxes, detectSandbox } from "sandbox-cli-detector";

const result = detectSandbox({
  sandboxes: defaultSandboxes.filter((sandbox) => sandbox.category !== "cloud-ide"),
});
```

### Custom sandbox definitions

Use custom definitions when you know about an internal sandbox or want to test
against a controlled environment object.

```ts
import { detectSandbox, defaultSandboxes } from "sandbox-cli-detector";

const result = detectSandbox({
  env: {
    INTERNAL_SANDBOX: "true",
    INTERNAL_SANDBOX_ID: "dev-123",
  },
  sandboxes: [
    {
      id: "internal",
      name: "Internal Sandbox",
      category: "ai-sandbox",
      env: [{ name: "INTERNAL_SANDBOX", value: "true" }],
      idEnv: ["INTERNAL_SANDBOX_ID"],
      verified: true,
    },
    ...defaultSandboxes,
  ],
});
```

## Contributing platform detections

The best detection signals are stable environment variables that are present in
every shell for that platform and absent elsewhere.

To propose a new platform, open an issue or PR with:

- The platform name and URL.
- The output of `env | sort` from inside the platform, with secrets removed.
- Which variables identify the platform.
- Which variable, if any, contains the sandbox or instance id.

You can also run:

```sh
npx sandbox-cli-detector --json
```

## License

MIT
