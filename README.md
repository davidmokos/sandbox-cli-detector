# sandbox-cli-detector

Detect whether a JavaScript CLI is running inside a sandboxed environment.

Please open an issue if a sandbox is missing or incorrectly detected.

## Installation

```sh
npm install sandbox-cli-detector
```

## Usage

```ts
import { detectSandbox } from "sandbox-cli-detector";

const result = detectSandbox();

if (result.detected) {
  console.log("Sandbox:", result.sandbox?.name);
} else {
  console.log("Not running inside a known sandbox");
}
```

When a sandbox is detected, the result contains its stable id and display name:

```json
{
  "detected": true,
  "sandbox": {
    "id": "e2b",
    "name": "E2B"
  }
}
```

When no sandbox is detected, the result is `{ "detected": false }`.

## Supported sandboxes

| Name | ID | Detection environment variables |
| --- | --- | --- |
| [bolt.new](https://bolt.new) | `bolt` | `BOLT_ENV`, `BOLT_ORIGIN`, or `BOLT_SERVER_URL` |
| [Rork](https://rork.com) | `rork` | `RORK_API_URL` |
| [E2B](https://e2b.dev) | `e2b` | `E2B_SANDBOX=true` |
| [Vercel Sandbox](https://vercel.com/docs/sandbox) | `vercel-sandbox` | `HOME=/home/vercel-sandbox` |
| [Daytona](https://daytona.io) | `daytona` | `DAYTONA_SANDBOX_ID` |
| [Modal](https://modal.com) | `modal` | `MODAL_SANDBOX_ID` or `MODAL_TASK_ID` |
| [Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/) | `cloudflare-sandbox` | `CLOUDFLARE_DURABLE_OBJECT_ID` |
| [GitHub Codespaces](https://github.com/features/codespaces) | `codespaces` | `CODESPACES=true` |
| [CodeSandbox](https://codesandbox.io) | `codesandbox` | `CSB=true` or `CSB_SANDBOX_ID` |

Detection uses environment variables. If multiple sandboxes match, the first
definition in `defaultSandboxes` is returned.

## API

### `detectSandbox(options?)`

Returns a `DetectionResult`:

```ts
interface DetectionResult {
  detected: boolean;
  sandbox?: {
    id: string;
    name: string;
  };
}
```

`sandbox.id` is stable and intended for programmatic checks. `sandbox.name` is
display text and may change.

Options:

```ts
interface DetectSandboxOptions {
  env?: NodeJS.ProcessEnv;
  sandboxes?: readonly SandboxDefinition[];
}
```

`env` defaults to `process.env`. `sandboxes` defaults to `defaultSandboxes`.

### `isRunningInSandbox(options?)`

Returns the detection result as a boolean:

```ts
import { isRunningInSandbox } from "sandbox-cli-detector";

if (isRunningInSandbox()) {
  // Adjust CLI behavior for sandboxed execution.
}
```

### Custom sandboxes

Pass custom definitions when you need to detect an internal environment:

```ts
import { defaultSandboxes, detectSandbox } from "sandbox-cli-detector";

const result = detectSandbox({
  sandboxes: [
    {
      id: "internal",
      name: "Internal Sandbox",
      env: [{ name: "INTERNAL_SANDBOX", value: "true" }],
    },
    ...defaultSandboxes,
  ],
});
```

Each environment signal matches either an exact `value` or any non-empty value
when `value` is omitted.

## CLI

```sh
npx sandbox-cli-detector
# detected: E2B

npx sandbox-cli-detector --json
# prints the DetectionResult as JSON

npx sandbox-cli-detector --quiet
# no output, exit code only
```

The CLI exits with `0` when a sandbox is detected and `1` otherwise.

## Contributing detections

Please include the platform name, a redacted `env | sort` captured inside the
platform, and the variables that identify it.

## License

MIT
