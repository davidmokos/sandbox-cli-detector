import { defaultSandboxes } from "./sandboxes.js";
import type { DetectSandboxOptions, DetectionResult, EnvSignal } from "./types.js";

export { defaultSandboxes } from "./sandboxes.js";
export type {
  DetectedSandbox,
  DetectionResult,
  DetectSandboxOptions,
  EnvSignal,
  SandboxDefinition,
} from "./types.js";

export function detectSandbox(options: DetectSandboxOptions = {}): DetectionResult {
  const env = options.env ?? process.env;
  const sandboxes = options.sandboxes ?? defaultSandboxes;
  const sandbox = sandboxes.find((candidate) =>
    candidate.env.some((signal) => matchesEnvSignal(signal, env)),
  );

  if (sandbox === undefined) return { detected: false };

  return {
    detected: true,
    sandbox: { id: sandbox.id, name: sandbox.name },
  };
}

export function isRunningInSandbox(options: DetectSandboxOptions = {}): boolean {
  return detectSandbox(options).detected;
}

function matchesEnvSignal(signal: EnvSignal, env: NodeJS.ProcessEnv): boolean {
  const value = env[signal.name];
  return (
    value !== undefined &&
    value !== "" &&
    (signal.value === undefined || value === signal.value)
  );
}
