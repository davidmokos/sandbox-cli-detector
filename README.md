# sandbox-cli-detector

Detect whether your CLI is running inside a sandboxed environment — an AI code-execution sandbox (E2B, Vercel Sandbox, Daytona, Modal, ...), an AI app builder (Replit, bolt.new, Rork, ...), or a cloud development environment (Codespaces, CodeSandbox, ...).

Inspired by [ci-info](https://github.com/watson/ci-info) and a companion to [agent-cli-detector](https://github.com/davidmokos/detect-agent): `agent-cli-detector` tells you *which agent* is driving your CLI, this package tells you *where* it is running.

## Installation

```sh
npm install sandbox-cli-detector
```

## Usage

```ts
import { detectSandbox, isRunningInSandbox } from "sandbox-cli-detector";

if (isRunningInSandbox()) {
  // e.g. skip interactive prompts, adjust telemetry, relax auth flows
}

const result = detectSandbox();
// {
//   detected: true,
//   sandbox: {
//     id: "e2b",
//     name: "E2B",
//     category: "ai-sandbox",
//     instanceId: "sbx_abc123",
//     evidence: [{ envVar: "E2B_SANDBOX", value: "true" }]
//   },
//   matches: [ ... ]  // all matched sandboxes, most specific first
// }
```

Or from the command line (exit code 0 when a sandbox is detected, 1 otherwise):

```sh
npx sandbox-cli-detector          # "detected: E2B (sbx_abc123)" / "no sandbox detected"
npx sandbox-cli-detector --json   # full detection result as JSON
npx sandbox-cli-detector --quiet  # exit code only
```

Layered environments are common — an app builder may run its builds inside a generic AI sandbox. `result.sandbox` is the most specific match (app builder → AI sandbox → cloud IDE) and `result.matches` lists everything that matched.

## Supported environments

Detection currently relies on environment variables only. Every marker below was confirmed by probing the real platform — no guessed or documentation-only markers.

### AI code-execution sandboxes

| Sandbox | id | Detection env vars |
| --- | --- | --- |
| [E2B](https://e2b.dev) | `e2b` | `E2B_SANDBOX=true` (id: `E2B_SANDBOX_ID`) |
| [Vercel Sandbox](https://vercel.com/docs/sandbox) | `vercel-sandbox` | `HOME=/home/vercel-sandbox` |
| [Daytona](https://daytona.io) | `daytona` | `DAYTONA_SANDBOX_ID` |
| [Modal](https://modal.com) | `modal` | `MODAL_SANDBOX_ID` or `MODAL_TASK_ID` |
| [Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/) | `cloudflare-sandbox` | `CLOUDFLARE_DURABLE_OBJECT_ID` |

### AI app builders

| Sandbox | id | Detection env vars |
| --- | --- | --- |
| [Replit](https://replit.com) | `replit` | `REPLIT_SESSION`, `REPLIT_CONTAINER`, or `REPLIT_USER` |
| [bolt.new](https://bolt.new) | `bolt` | `BOLT_ENV`, `BOLT_ORIGIN`, or `BOLT_SERVER_URL` |
| [Rork](https://rork.com) | `rork` | `RORK_API_URL` (runs on E2B, so `e2b` also matches) |

Lovable, v0, and Base44 are intentionally not on the list: they expose no shell, so a CLI can never run inside them.

### Cloud development environments

| Sandbox | id | Detection env vars |
| --- | --- | --- |
| [GitHub Codespaces](https://github.com/features/codespaces) | `codespaces` | `CODESPACES=true` (id: `CODESPACE_NAME`) |
| [CodeSandbox](https://codesandbox.io) | `codesandbox` | `CSB=true` or `CSB_SANDBOX_ID` (id: `CSB_SANDBOX_ID`) |

Missing a platform (Morph, Runloop, Gitpod, Cloud Shell, Coder, ...)? Please open an issue or PR with the env vars it sets — the fastest way to check is running `env | sort` (or `npx sandbox-cli-detector --json`) inside it.

## API

### `detectSandbox(options?)`

Returns a `DetectionResult`:

- `detected: boolean`
- `sandbox: DetectedSandbox | null` — the most specific match
- `matches: DetectedSandbox[]` — all matches, in definition order

Each `DetectedSandbox` has `id`, `name`, `category` (`"ai-sandbox" | "app-builder" | "cloud-ide"`), optional `instanceId`, and the `evidence` (which env vars matched).

Options:

- `env` — environment to inspect (defaults to `process.env`)
- `sandboxes` — custom `SandboxDefinition[]` (defaults to the built-in list)
- `strategies` — custom `DetectionStrategy[]` (defaults to env-variable detection; more strategies, e.g. filesystem markers, may come later)

### `isRunningInSandbox(options?)`

Convenience wrapper returning just the boolean.

### `defaultSandboxes`

The built-in `SandboxDefinition[]`, exported so you can extend or filter it.

## License

MIT
