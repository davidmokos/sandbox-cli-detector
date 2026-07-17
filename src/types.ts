/** A single environment variable condition. */
export interface EnvCondition {
  /** Environment variable name. */
  name: string;
  /** Exact expected value. If omitted, any non-empty value matches. */
  value?: string;
}

/**
 * One way a sandbox can be recognized from the environment.
 * A single condition, or a group of conditions that must ALL hold.
 * A sandbox's `env` list is OR-ed: any one matcher is enough.
 */
export type EnvMatcher = EnvCondition | EnvCondition[];

export type SandboxCategory =
  /** Ephemeral code-execution sandboxes used by AI agents (E2B, Daytona, Modal, ...). */
  | "ai-sandbox"
  /** AI app builders that run user code in their own sandboxes (Lovable, Replit, bolt.new, ...). */
  | "app-builder"
  /** Cloud development environments (Codespaces, Gitpod, Cloud Shell, ...). */
  | "cloud-ide";

export interface SandboxDefinition {
  /** Stable identifier, e.g. "e2b". */
  id: string;
  /** Display name, e.g. "E2B". */
  name: string;
  category: SandboxCategory;
  /** Env matchers; matching ANY entry means this sandbox is detected. */
  env: EnvMatcher[];
  /** Env vars that carry the sandbox/instance id; first one present wins. */
  idEnv?: string[];
  /** True once the markers have been confirmed on the real platform. */
  verified: boolean;
}

/** A matched env var, kept as evidence for debugging. */
export interface DetectionEvidence {
  envVar: string;
  value: string;
}

export interface DetectedSandbox {
  id: string;
  name: string;
  category: SandboxCategory;
  /** Sandbox/instance id when the platform exposes one (e.g. E2B_SANDBOX_ID). */
  instanceId?: string;
  evidence: DetectionEvidence[];
}

export interface DetectionContext {
  env: Record<string, string | undefined>;
}

export interface DetectionStrategy {
  /** Strategy identifier, e.g. "env". */
  readonly id: string;
  detect(sandbox: SandboxDefinition, context: DetectionContext): DetectedSandbox | null;
}

export interface DetectSandboxOptions {
  /** Environment to inspect. Defaults to process.env. */
  env?: Record<string, string | undefined>;
  /** Sandbox definitions to check. Defaults to the built-in list. */
  sandboxes?: readonly SandboxDefinition[];
  /** Detection strategies to run. Defaults to env-variable detection. */
  strategies?: readonly DetectionStrategy[];
}

export interface DetectionResult {
  detected: boolean;
  /**
   * The most specific match (definitions are ordered app-builder →
   * ai-sandbox → cloud-ide, so a Lovable build running on E2B reports Lovable).
   */
  sandbox: DetectedSandbox | null;
  /** All sandboxes that matched, in definition order. */
  matches: DetectedSandbox[];
}
