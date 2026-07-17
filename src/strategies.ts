import type {
  DetectedSandbox,
  DetectionContext,
  DetectionEvidence,
  DetectionStrategy,
  EnvCondition,
  SandboxDefinition,
} from "./types.js";

function matchCondition(
  condition: EnvCondition,
  env: Record<string, string | undefined>,
): DetectionEvidence | null {
  const value = env[condition.name];
  if (value === undefined || value === "") return null;
  if (condition.value !== undefined && value !== condition.value) return null;
  return { envVar: condition.name, value };
}

/** Detects a sandbox purely from environment variables. */
export class EnvironmentDetectionStrategy implements DetectionStrategy {
  readonly id = "env";

  detect(sandbox: SandboxDefinition, context: DetectionContext): DetectedSandbox | null {
    for (const matcher of sandbox.env) {
      const conditions = Array.isArray(matcher) ? matcher : [matcher];
      if (conditions.length === 0) continue;

      const evidence: DetectionEvidence[] = [];
      for (const condition of conditions) {
        const matched = matchCondition(condition, context.env);
        if (!matched) break;
        evidence.push(matched);
      }
      if (evidence.length !== conditions.length) continue;

      return {
        id: sandbox.id,
        name: sandbox.name,
        category: sandbox.category,
        instanceId: this.findInstanceId(sandbox, context),
        evidence,
      };
    }
    return null;
  }

  private findInstanceId(
    sandbox: SandboxDefinition,
    context: DetectionContext,
  ): string | undefined {
    for (const name of sandbox.idEnv ?? []) {
      const value = context.env[name];
      if (value) return value;
    }
    return undefined;
  }
}

export function createDefaultStrategies(): DetectionStrategy[] {
  return [new EnvironmentDetectionStrategy()];
}
