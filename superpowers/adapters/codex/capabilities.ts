export const CODEX_ADAPTER_RUNTIME_CAPABILITIES = [
  "workspace.read",
  "workspace.search",
  "artifact.attach",
  "image.inspect",
  "screenshot.capture"
] as const;

export const CODEX_RUNNER_MANAGED_CAPABILITIES = [
  "workspace.write",
  "process.exec"
] as const;

export const CODEX_EXPERIMENTAL_CAPABILITIES = [
  "agent.spawn"
] as const;

export const CODEX_ALWAYS_AVAILABLE_CAPABILITIES = [
  "workspace.read",
  "workspace.search",
  "artifact.attach",
  "workspace.write",
  "process.exec"
] as const;

export const CODEX_CAPABILITY_MODEL = {
  adapter_runtime_capabilities: CODEX_ADAPTER_RUNTIME_CAPABILITIES,
  runner_managed_capabilities: CODEX_RUNNER_MANAGED_CAPABILITIES,
  always_available_capabilities: CODEX_ALWAYS_AVAILABLE_CAPABILITIES,
  experimental_capabilities: CODEX_EXPERIMENTAL_CAPABILITIES
} as const;

export const CODEX_CAPABILITIES = [
  ...CODEX_ADAPTER_RUNTIME_CAPABILITIES,
  ...CODEX_RUNNER_MANAGED_CAPABILITIES
] as const;

export const CODEX_KNOWN_CAPABILITIES = [
  ...CODEX_CAPABILITIES,
  ...CODEX_EXPERIMENTAL_CAPABILITIES
] as const;

export type CodexCapability =
  | (typeof CODEX_ADAPTER_RUNTIME_CAPABILITIES)[number]
  | (typeof CODEX_RUNNER_MANAGED_CAPABILITIES)[number]
  | (typeof CODEX_ALWAYS_AVAILABLE_CAPABILITIES)[number]
  | (typeof CODEX_EXPERIMENTAL_CAPABILITIES)[number];

export function hasCodexCapabilities(requiredCapabilities: string[]): boolean {
  return missingCodexCapabilities(requiredCapabilities).length === 0;
}

export function missingCodexCapabilities(requiredCapabilities: string[]): string[] {
  const available = new Set<string>(CODEX_CAPABILITIES);
  return requiredCapabilities.filter((capability) => !available.has(capability));
}

export function unknownCodexCapabilities(requiredCapabilities: string[]): string[] {
  const known = new Set<string>(CODEX_KNOWN_CAPABILITIES);
  return requiredCapabilities.filter((capability) => !known.has(capability));
}
