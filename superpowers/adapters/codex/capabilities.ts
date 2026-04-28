export const CODEX_CAPABILITIES = [
  "workspace.read",
  "workspace.write",
  "workspace.search",
  "process.exec",
  "artifact.attach",
  "image.inspect",
  "screenshot.capture",
  "agent.spawn"
] as const;

export type CodexCapability = (typeof CODEX_CAPABILITIES)[number];

export function hasCodexCapabilities(requiredCapabilities: string[]): boolean {
  return missingCodexCapabilities(requiredCapabilities).length === 0;
}

export function missingCodexCapabilities(requiredCapabilities: string[]): string[] {
  const supported = new Set<string>(CODEX_CAPABILITIES);
  return requiredCapabilities.filter((capability) => !supported.has(capability));
}
