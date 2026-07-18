export interface EnvSignal {
  readonly name: string;
  readonly value?: string;
}

export interface DetectedSandbox {
  readonly id: string;
  readonly name: string;
}

export interface SandboxDefinition extends DetectedSandbox {
  readonly env: readonly EnvSignal[];
}

export interface DetectSandboxOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly sandboxes?: readonly SandboxDefinition[];
}

export interface DetectionResult {
  readonly detected: boolean;
  readonly sandbox?: DetectedSandbox;
}
