# P1 Real Codex Adapter + Verification Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Background reference. Current real Codex adapter behavior lives under `superpowers/adapters/codex/`, live verification lives under `superpowers/runner/`, and current implementation rules live under `docs/superpowers/harness/`.

**Goal:** Replace the P0 mock Codex adapter path with a real Codex CLI/API adapter and make the harness verification suite one-command repeatable while preserving artifact contracts and lifecycle gates.

**Architecture:** Keep the harness as the owner of routing, context assembly, validation, QA, repair, and publish. Add a concrete adapter implementation that accepts the existing invocation bundle, invokes Codex, persists raw execution evidence, extracts artifact candidates deterministically, and returns the same `CodexInvocationResult` shape used by the runner today.

**Tech Stack:** Node 22 TypeScript run with `node --experimental-strip-types`, existing JSON schemas, existing YAML registry/profile loader, no package dependency unless a later step explicitly proves it is needed.

---

## File Structure

- Modify: `superpowers/adapters/codex/adapter.ts`
  - Keep `MockCodexAdapter`.
  - Add a real adapter implementation behind an environment or option switch.
  - Preserve the existing `CodexAdapter` interface.
- Create: `superpowers/adapters/codex/extract-artifacts.ts`
  - Deterministically extract JSON artifact envelopes from adapter stdout or structured output files.
- Create: `superpowers/adapters/codex/real-adapter.ts`
  - Own process/API invocation, timeout handling, stdout/stderr capture, and failure mode mapping.
- Modify: `superpowers/runner/invoke-backend.ts`
  - Select mock or real adapter.
  - Persist raw request and raw response under the stage directory before validation.
- Modify: `superpowers/runner/verify-p0-harness.ts`
  - Keep mock verifier as the default deterministic test.
  - Add an optional real-adapter smoke gate that runs only when configured.
- Create: `docs/superpowers/harness/2026-04-25-codex-adapter-contract.md`
  - Document runtime configuration, expected output protocol, and failure modes.

## Task 1: Adapter Mode Selection

**Files:**
- Modify: `superpowers/adapters/codex/adapter.ts`
- Modify: `superpowers/runner/invoke-backend.ts`

- [ ] **Step 1: Add an adapter mode type**

Add:

```ts
export type CodexAdapterMode = "mock" | "real";
```

- [ ] **Step 2: Change `createCodexAdapter()` signature**

Update it to:

```ts
export function createCodexAdapter(mode: CodexAdapterMode = "mock"): CodexAdapter {
  if (mode === "real") {
    throw new Error("Real Codex adapter is not implemented yet.");
  }

  return new MockCodexAdapter();
}
```

- [ ] **Step 3: Select mode in `invoke-backend.ts`**

Read:

```ts
const adapterMode = process.env.FUSERA_CODEX_ADAPTER === "real" ? "real" : "mock";
const adapter = createCodexAdapter(adapterMode);
```

- [ ] **Step 4: Verify default behavior**

Run:

```bash
node --experimental-strip-types superpowers/runner/verify-p0-harness.ts
```

Expected: verifier passes using the mock adapter.

## Task 2: Artifact Extraction Boundary

**Files:**
- Create: `superpowers/adapters/codex/extract-artifacts.ts`

- [ ] **Step 1: Define extractor input/output**

Create:

```ts
import type { ArtifactEnvelope } from "../../runner/validate-artifact.ts";

export type ArtifactExtractionResult = {
  candidates: ArtifactEnvelope[];
  errors: string[];
};
```

- [ ] **Step 2: Implement fenced JSON extraction**

Accept output blocks in this protocol:

````markdown
```fusera-artifact-json
{ "artifact_type": "ProductBrief", "...": "..." }
```
````

Implementation should:

```ts
export function extractArtifactsFromText(text: string): ArtifactExtractionResult {
  const pattern = /```fusera-artifact-json\s*([\s\S]*?)```/g;
  const candidates: ArtifactEnvelope[] = [];
  const errors: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    try {
      candidates.push(JSON.parse(match[1]) as ArtifactEnvelope);
    } catch (error) {
      errors.push(`Invalid artifact JSON block: ${(error as Error).message}`);
    }
  }

  return { candidates, errors };
}
```

- [ ] **Step 3: Add extractor self-test command**

Add a CLI path that reads a text file and prints extraction result:

```bash
node --experimental-strip-types superpowers/adapters/codex/extract-artifacts.ts sample-output.txt
```

Expected: valid artifact blocks become candidates, malformed blocks produce errors.

## Task 3: Real Adapter Process Wrapper

**Files:**
- Create: `superpowers/adapters/codex/real-adapter.ts`
- Modify: `superpowers/adapters/codex/adapter.ts`

- [ ] **Step 1: Implement `RealCodexAdapter` skeleton**

Create a class implementing `CodexAdapter`:

```ts
export class RealCodexAdapter implements CodexAdapter {
  id = "codex" as const;
  capabilities = CODEX_CAPABILITIES;

  async invoke(bundle: CodexInvocationBundle): Promise<CodexInvocationResult> {
    throw new Error("Real Codex invocation not wired yet.");
  }
}
```

- [ ] **Step 2: Add process command configuration**

Use env vars:

```ts
const command = process.env.FUSERA_CODEX_COMMAND ?? "codex";
const timeoutMs = Number(process.env.FUSERA_CODEX_TIMEOUT_MS ?? "120000");
```

- [ ] **Step 3: Serialize bundle to stdin**

The real adapter should pass a compact invocation payload to the process:

```json
{
  "stage": "page-strategy",
  "selected_pack_ids": ["tasks/page-strategy"],
  "stage_profile": {},
  "run": {},
  "input_artifact_refs": [],
  "materialized_artifacts": {},
  "output_contract_refs": [],
  "repair_directives": []
}
```

- [ ] **Step 4: Map failures**

Map failures to existing `failure_mode` values:

- process exit non-zero: `invocation_failure`
- extractor errors with no candidates: `extraction_failure`
- candidates present but later rejected: runner-owned `validation_failure`
- no required candidates: runner-owned `missing_output`

## Task 4: Prompt/Output Protocol Documentation

**Files:**
- Create: `docs/superpowers/harness/2026-04-25-codex-adapter-contract.md`
- Modify: pack `SKILL.md` files only if the protocol requires a short output block rule.

- [ ] **Step 1: Document adapter input bundle**

Include the exact bundle fields already emitted by `invoke-backend.ts`.

- [ ] **Step 2: Document artifact output protocol**

Require artifact candidates to be emitted only in fenced `fusera-artifact-json` blocks.

- [ ] **Step 3: Document forbidden behavior**

State that the adapter must not write stable artifacts directly to `.fusera/runs/`; only the runner validates and persists stable artifacts.

## Task 5: Verification Gates

**Files:**
- Modify: `superpowers/runner/verify-p0-harness.ts`

- [ ] **Step 1: Keep deterministic mock verification**

The default command must remain:

```bash
node --experimental-strip-types superpowers/runner/verify-p0-harness.ts
```

Expected: no network or real Codex dependency.

- [ ] **Step 2: Add optional real adapter verification**

Support:

```bash
FUSERA_CODEX_ADAPTER=real node --experimental-strip-types superpowers/runner/run-stage.ts smoke
```

Expected when Codex is unavailable: fail closed with an invocation failure and persisted raw evidence.

- [ ] **Step 3: Add negative extraction fixture**

Feed malformed artifact JSON into `extractArtifactsFromText()`.

Expected: extraction errors are returned and no artifact is persisted as validated.

## Acceptance Criteria

- Default P0 verifier remains deterministic and passes without external services.
- Real adapter mode is opt-in.
- Raw real-adapter input/output is persisted before extraction and validation.
- Stable artifacts are never written directly by the adapter.
- Artifact extraction is deterministic and testable without invoking Codex.
- Runner validation and lifecycle gates remain unchanged for mock and real adapters.
