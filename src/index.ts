import { defaultSandboxes } from "./sandboxes.js";
import { createDefaultStrategies } from "./strategies.js";
import type { DetectedSandbox, DetectionResult, DetectSandboxOptions } from "./types.js";

export { defaultSandboxes } from "./sandboxes.js";
export { createDefaultStrategies, EnvironmentDetectionStrategy } from "./strategies.js";
export type {
  DetectedSandbox,
  DetectionContext,
  DetectionEvidence,
  DetectionResult,
  DetectionStrategy,
  DetectSandboxOptions,
  EnvCondition,
  EnvMatcher,
  SandboxCategory,
  SandboxDefinition,
} from "./types.js";

/**
 * Detect whether the current process runs inside a known sandboxed
 * environment (AI code-execution sandbox, AI app builder, or cloud IDE).
 */
export function detectSandbox(options: DetectSandboxOptions = {}): DetectionResult {
  const env = options.env ?? process.env;
  const sandboxes = options.sandboxes ?? defaultSandboxes;
  const strategies = options.strategies ?? createDefaultStrategies();
  const context = { env };

  const matches: DetectedSandbox[] = [];
  for (const sandbox of sandboxes) {
    for (const strategy of strategies) {
      const detected = strategy.detect(sandbox, context);
      if (detected) {
        matches.push(detected);
        break;
      }
    }
  }

  return {
    detected: matches.length > 0,
    sandbox: matches[0] ?? null,
    matches,
  };
}

/** Convenience wrapper returning just the boolean. */
export function isRunningInSandbox(options: DetectSandboxOptions = {}): boolean {
  return detectSandbox(options).detected;
}
