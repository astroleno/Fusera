# Unified Harness Core Web Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Web generation and CLI generation execute the same canonical Fusera Harness, with durable evidence and visible frontend progress, without introducing DeerFlow or a second orchestration model.

**Architecture:** The Next.js API creates a queued `generation_runs` row. The existing Trigger.dev task remains a lightweight control-plane dispatcher, but it does not execute the Harness: Trigger.dev v4 currently offers Node 22.16 while Fusera's canonical live preflight requires Node 24. Trigger.dev dispatches a dedicated GitHub Actions workflow to the existing `fusera-live` self-hosted Node 24 runner. That workflow calls the same `runGeneration()` core used by CLI, projects events and validated artifacts into Supabase, and mirrors the canonical run bundle into private Supabase Storage. The frontend polls a small status route and refreshes the preview when the run reaches a terminal state.

**Tech Stack:** Node.js 24 for live Harness execution, TypeScript, Next.js App Router, React, Vitest, Trigger.dev v4, GitHub Actions `workflow_dispatch`, Supabase Postgres and Storage, existing Fusera artifact contracts and Codex adapter.

---

## 1. Confirmed decisions

Target flow:

```text
Next.js intake
  -> POST /api/projects/:id/generate
  -> generation_runs(status=queued)
  -> Trigger.dev dispatch task
  -> GitHub Actions web-generation.yml
  -> self-hosted fusera-live runner (Node 24 + Codex)
  -> runGeneration()
  -> validated run bundle
  -> Supabase artifacts/events/evidence projection
  -> frontend status polling + preview refresh
```

CLI flow:

```text
bin/fusera.mjs -> runFixture() -> runGeneration() -> .fusera/runs/<run-id>
```

The canonical execution truth remains:

```text
.fusera/runs/<run-id>/
  run.json
  events.ndjson
  artifacts/*.json
  compiled/*
  previews/*
  stages/*
  logs/*
```

For Web runs, the same files are mirrored to the private bucket:

```text
fusera-run-evidence/projects/<project-id>/runs/<run-id>/
```

Lifecycle mapping:

| Harness state | Product generation status | Review state | Export state |
|---|---|---|---|
| `queued` | `queued` | `none` | `none` |
| active stage | `running` | `validating` | `none` |
| `published` | `completed` | `review_ready` | `export_ready` |
| `needs_review` | `completed` | `qa_failed` | `none` |
| `failed` | `failed` | `none` unless QA exists | `none` |

`PublishVersion` means preview-ready. It must never be presented as an externally published page.

Out of scope:

- DeerFlow, multi-agent execution, DAG scheduling, fan-out, or fan-in.
- A real external hosting/publishing adapter.
- A visual redesign of the editor.
- Changing artifact schemas, `registry.yaml`, or `stage-profiles.yaml`.
- Replacing the existing self-hosted live runner with a new infrastructure provider.

Hard prerequisite: the `fusera-live` runner must pass the existing `checkLiveRunner({ strictGithubActions: true, authProbe: true })` check. If that runner is not available, stop after Task 5; do not weaken the Node 24 or Codex authentication requirements to make Trigger.dev execute the Harness directly.

External implementation references:

- [Trigger.dev v4 runtime configuration](https://trigger.dev/docs/config/config-file)
- [GitHub workflow dispatch REST endpoint](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)
- [Codex CLI authentication](https://developers.openai.com/codex/auth/)

---

### Task 1: Expose one application-callable Harness entry point

**Files:**

- Create: `superpowers/runner/run-observer.ts`
- Create: `superpowers/runner/run-generation.ts`
- Modify: `superpowers/runner/run-stage.ts`
- Modify: `superpowers/runner/write-run-event.ts`
- Create: `tests/unit/harness-run-generation.test.ts`
- Test: `tests/unit/harness-run-generation.test.ts`

**Step 1: Write a failing shared-entry test**

Create `tests/unit/harness-run-generation.test.ts`. Use a temporary runs root and assert that `runGeneration()`:

- Accepts an input object instead of requiring an input file.
- Accepts a caller-owned UUID as `runId`.
- Writes to `<runsRoot>/<runId>`.
- Stores `input_ref: null` for Web-style calls.
- Produces the existing mock Harness result without changing stage semantics.
- Calls observer hooks only after local records/events exist on disk.

The core test call is:

```ts
const result = await runGeneration({
  rootDir: process.cwd(),
  runsRoot,
  runId: "11111111-1111-4111-8111-111111111111",
  input: fixtureInput,
  inputRef: null,
  mode: "publish",
  adapterMode: "mock",
  observer
});
```

Run:

```bash
npx vitest run --config vitest.node.config.ts tests/unit/harness-run-generation.test.ts
```

Expected: FAIL because `run-generation.ts` does not exist.

**Step 2: Define the observer seam**

Create `superpowers/runner/run-observer.ts`:

```ts
import type { RunEvent } from "./write-run-event.ts";

export type HarnessRunObserver = {
  onRunRecord?(context: {
    runDir: string;
    record: Record<string, unknown>;
  }): Promise<void>;
  onRunEvent?(context: {
    runDir: string;
    event: RunEvent;
  }): Promise<void>;
};
```

Observer errors propagate. A Web run must fail if its durable projection cannot be written.

**Step 3: Extract `runGeneration` in place**

Keep all shared stage helpers in `superpowers/runner/run-stage.ts`; continuation, retry, and proof flows already depend on them. Add these types there:

```ts
export type RunGenerationOptions = {
  rootDir?: string;
  runsRoot?: string;
  runId?: string;
  input: Record<string, unknown>;
  inputRef?: string | null;
  mode?: "publish" | "qa-failure";
  stopAfterStage?: string;
  adapterMode?: CodexAdapterMode;
  observer?: HarnessRunObserver;
};

export type GenerationRunResult = {
  run_id: string;
  run_dir: string;
  final_state: string;
  artifacts: string[];
  preview_build_ref?: string;
};
```

Rename the current execution body mechanically:

```diff
-export async function runFixture(options: {
-  rootDir?: string;
-  inputPath?: string;
-  mode?: "publish" | "qa-failure";
-  stopAfterStage?: string;
-  adapterMode?: CodexAdapterMode;
-} = {}): Promise<FixtureRunResult> {
+export async function runGeneration(options: RunGenerationOptions): Promise<GenerationRunResult> {
```

Replace only the input/identity setup:

```ts
const rootDir = options.rootDir ?? process.cwd();
const runsRoot = options.runsRoot ?? path.join(rootDir, ".fusera/runs");
const runId = options.runId ?? makeRunId();
const runDir = path.join(runsRoot, runId);
const input = structuredClone(options.input);
const inputRef = options.inputRef ?? null;
```

Set these run-record fields:

```ts
input_ref: inputRef,
input_payload: input,
```

Do not change stage order, pack resolution, adapter behavior, retries, artifact validation, deterministic compilation, QA, or preview publishing.

**Step 4: Make durable writes observable**

Change `writeRunEvent` to accept an optional observer. Append and validate locally first, then notify:

```ts
export async function writeRunEvent(
  runDir: string,
  event: RunEvent,
  observer?: HarnessRunObserver
): Promise<RunEvent> {
  await mkdir(runDir, { recursive: true });
  const normalized: RunEvent = {
    event_id: event.event_id ?? makeEventId(),
    ts: event.ts ?? new Date().toISOString(),
    ...event
  };
  const errors = validateRunEventRecord(normalized as Record<string, unknown>);
  if (errors.length > 0) {
    throw new Error(`Invalid run event: ${errors.join("; ")}`);
  }
  await appendFile(path.join(runDir, "events.ndjson"), `${JSON.stringify(normalized)}\n`, "utf8");
  await observer?.onRunEvent?.({ runDir, event: normalized });
  return normalized;
}
```

Thread `observer` through every event-emitting helper in the shared run path. Update `writeRunRecord` similarly:

```ts
async function writeRunRecord(
  runDir: string,
  record: Record<string, unknown>,
  observer?: HarnessRunObserver
): Promise<void> {
  await writeFile(path.join(runDir, "run.json"), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  await observer?.onRunRecord?.({ runDir, record });
}
```

**Step 5: Restore `runFixture` as a compatibility wrapper**

Keep CLI imports unchanged. `runFixture` reads the fixture file and calls `runGeneration`:

```ts
export type FixtureRunResult = GenerationRunResult;

export async function runFixture(options: {
  rootDir?: string;
  inputPath?: string;
  mode?: "publish" | "qa-failure";
  stopAfterStage?: string;
  adapterMode?: CodexAdapterMode;
} = {}): Promise<FixtureRunResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const inputPath = options.inputPath ?? path.join(
    rootDir,
    "superpowers/runner/fixtures/landing-input.json"
  );
  const input = JSON.parse(await readFile(inputPath, "utf8")) as Record<string, unknown>;
  return runGeneration({
    rootDir,
    input,
    inputRef: path.relative(rootDir, inputPath),
    mode: options.mode,
    stopAfterStage: options.stopAfterStage,
    adapterMode: options.adapterMode
  });
}
```

Create the stable Web import facade `superpowers/runner/run-generation.ts`:

```ts
export {
  runGeneration,
  type GenerationRunResult,
  type RunGenerationOptions
} from "./run-stage.ts";
```

**Step 6: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/harness-run-generation.test.ts tests/unit/run-event-types.test.ts tests/unit/harness-graph.test.ts
npm run harness:verify
git add superpowers/runner/run-observer.ts superpowers/runner/run-generation.ts superpowers/runner/run-stage.ts superpowers/runner/write-run-event.ts tests/unit/harness-run-generation.test.ts
git commit -m "refactor: expose shared harness run entry point"
```

Expected: tests pass and existing CLI Harness verification remains green.

---

### Task 2: Map Web intake into the Harness input contract

**Files:**

- Create: `superpowers/integrations/web/project-input-to-harness.ts`
- Create: `tests/unit/project-input-to-harness.test.ts`
- Test: `tests/unit/project-input-to-harness.test.ts`

**Step 1: Write the failing mapping test**

Assert that the mapping preserves product name, target audience, selling points, product details, CTA, brand keywords, tone, visual direction, images, references, trust signals, and proof sources. The test must also prove that proof identifiers are deterministic.

**Step 2: Implement the explicit boundary**

Create `superpowers/integrations/web/project-input-to-harness.ts`:

```ts
export type WebProjectInput = {
  productName: string;
  sellingPoints: string[];
  productDetails: Array<{ label: string; value: string }>;
  targetAudience: string;
  brandKeywords: string[];
  cta: string;
  visualDirectionId: string;
  imageUrls: string[];
  price?: string;
  trustSignals: string[];
  proofSources: Array<{ claim: string; source: string; url?: string }>;
  tone?: string;
  referenceUrls: string[];
};

export function projectInputToHarness(input: WebProjectInput): Record<string, unknown> {
  const proofSources = input.proofSources.map((proof, index) => ({
    proof_ref: `proof:${index + 1}`,
    claim: proof.claim,
    source: proof.source,
    url: proof.url ?? null
  }));
  return {
    product_name: input.productName,
    audiences: [input.targetAudience],
    core_problem: `${input.targetAudience}需要一个能够清晰呈现${input.productName}价值的购买页面。`,
    value_props: [...input.sellingPoints],
    product_details: input.productDetails.map((item) => ({ ...item })),
    cta_goal: input.cta,
    proof_inputs: [...input.trustSignals],
    proof_sources: proofSources,
    claim_policy: proofSources.length > 0 ? "proof-required" : "low-proof",
    brand_traits: [...input.brandKeywords],
    tone_keywords: input.tone ? [input.tone] : [...input.brandKeywords],
    visual_directions: [input.visualDirectionId],
    positioning: input.sellingPoints.join("；"),
    do_not_use: ["未经证实的数据声明", "与已提供素材不一致的产品承诺"],
    image_urls: [...input.imageUrls],
    reference_urls: [...input.referenceUrls],
    price: input.price ?? null
  };
}
```

The inferred `core_problem` is a transport fallback, not a product claim. If intake later gains an explicit problem field, replace this fallback in a separate schema migration.

**Step 3: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/project-input-to-harness.test.ts
git add superpowers/integrations/web/project-input-to-harness.ts tests/unit/project-input-to-harness.test.ts
git commit -m "feat: map web intake to harness input"
```

---

### Task 3: Add durable run, event, and evidence projections

**Files:**

- Create: `supabase/migrations/0006_harness_run_evidence.sql`
- Create: `tests/unit/harness-run-schema.test.ts`
- Test: `tests/unit/harness-run-schema.test.ts`

**Step 1: Write a failing migration contract test**

Read the migration as text and assert it contains operational run fields, an append-only event table, an evidence manifest, the private bucket, and executor correlation fields.

**Step 2: Add the migration**

Create `supabase/migrations/0006_harness_run_evidence.sql`:

```sql
alter table generation_runs
  add column backend text not null default 'codex',
  add column adapter_mode text,
  add column current_stage text,
  add column failed_stage text,
  add column failure_mode text,
  add column failure_message text,
  add column run_evidence_prefix text,
  add column trigger_run_handle_id text,
  add column executor_kind text,
  add column executor_run_id text,
  add column executor_run_url text,
  add column updated_at timestamptz not null default now(),
  add constraint generation_runs_adapter_mode_check
    check (adapter_mode is null or adapter_mode in ('mock', 'real')),
  add constraint generation_runs_executor_kind_check
    check (executor_kind is null or executor_kind in ('github-actions'));

create table generation_run_events (
  event_id text primary key,
  run_id uuid not null references generation_runs(id) on delete cascade,
  event_type text not null,
  stage text,
  from_state text,
  to_state text,
  data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index generation_run_events_run_time_idx
  on generation_run_events (run_id, occurred_at, event_id);

create table run_evidence_objects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  run_id uuid not null references generation_runs(id) on delete cascade,
  relative_path text not null,
  storage_key text not null,
  sha256 text not null,
  size_bytes bigint not null,
  content_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, relative_path),
  unique (storage_key)
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('fusera-run-evidence', 'fusera-run-evidence', false, 52428800)
on conflict (id) do update set public = excluded.public;
```

Do not add public Storage policies. Browser clients read status through Next.js routes; only service-role code writes evidence.

**Step 3: Verify, apply to development, and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/harness-run-schema.test.ts
npx supabase db push
git add supabase/migrations/0006_harness_run_evidence.sql tests/unit/harness-run-schema.test.ts
git commit -m "feat: add harness run evidence schema"
```

Expected: the test passes and migration 0006 applies to development without SQL errors. Do not apply it to production yet.

---

### Task 4: Build the Supabase Harness observer

**Files:**

- Create: `superpowers/integrations/supabase/mirror-run-evidence.ts`
- Create: `superpowers/integrations/supabase/supabase-harness-observer.ts`
- Create: `superpowers/integrations/supabase/sync-harness-artifacts.ts`
- Create: `tests/unit/mirror-run-evidence.test.ts`
- Create: `tests/unit/supabase-harness-observer.test.ts`
- Create: `tests/unit/sync-harness-artifacts.test.ts`
- Test: all three new test files

**Step 1: Test evidence mirroring with an in-memory port**

Define a narrow `EvidenceStore` with `upload()` and `upsertManifest()`. Test recursive regular-file discovery, ignored symbolic links, deterministic storage keys, SHA-256, byte size, and content type. No unit test may call a real Supabase project.

The public function is:

```ts
export async function mirrorRunEvidence(options: {
  store: EvidenceStore;
  projectId: string;
  runId: string;
  runDir: string;
}): Promise<void>;
```

Storage keys must be:

```ts
const storageKey = `projects/${projectId}/runs/${runId}/${relativePath}`;
```

Use `createHash("sha256")`, `readFile`, recursive `readdir({ withFileTypes: true })`, and `lstat`. Upload with `upsert: true`, then upsert the manifest on `run_id,relative_path`.

**Step 2: Test record/event projection**

Use a fake projection and assert:

- `start_run` sets `status=running`.
- Stage events update `current_stage`.
- `run_failed` records failure fields.
- A caller event whose `run_id` differs from the Web run is rejected.
- Duplicate `event_id` writes are idempotent.
- Evidence mirroring happens after the local file is durable.

Expose:

```ts
export function createHarnessObserver(options: {
  projectId: string;
  runId: string;
  projection: RunProjection;
  evidenceStore: EvidenceStore;
}): HarnessRunObserver;
```

Map final Harness records explicitly; never spread `run.json` into a database update:

```ts
function productStatus(state: unknown): "queued" | "running" | "completed" | "failed" {
  if (state === "published" || state === "needs_review") return "completed";
  if (state === "failed") return "failed";
  if (state === "queued") return "queued";
  return "running";
}
```

**Step 3: Test canonical artifact synchronization**

Create temporary validated and rejected envelopes. Assert:

- Both are upserted into `artifacts`.
- Only validated artifacts with zero validation errors advance `latest_*_ref`.
- Artifact `run_id` must match the caller-owned UUID.
- `published` maps to completed/review-ready/export-ready.
- `needs_review` maps to completed/qa-failed/no export.
- An early failed run without QA keeps review/export at `none`.
- `quality_score` reuses `src/lib/ai/quality-score.ts` with PageSpec section types and ProductBrief proof presence.

Use this exact latest-ref map:

```ts
const LATEST_REF_COLUMNS: Record<string, string> = {
  ProductBrief: "latest_product_brief_ref",
  BrandProfile: "latest_brand_profile_ref",
  PagePlan: "latest_page_plan_ref",
  SectionGraph: "latest_section_graph_ref",
  ThemeTokens: "latest_theme_tokens_ref",
  DesignSpec: "latest_design_spec_ref",
  PageSpec: "latest_page_spec_ref",
  QAReport: "latest_qa_report_ref",
  PublishVersion: "latest_publish_version_ref"
};
```

Rejected envelopes remain persisted with their validation errors, as required by the artifact contract.

**Step 4: Add the service-role adapters**

Adapt the existing Supabase client behind narrow structural types. Every Supabase error must throw. Use:

```ts
db.from("generation_run_events").upsert(row, { onConflict: "event_id" });
db.from("artifacts").upsert(rows, { onConflict: "artifact_id" });
db.storage.from("fusera-run-evidence").upload(storageKey, bytes, {
  contentType,
  upsert: true
});
```

Do not export `any` and do not import Next.js modules into `superpowers/`.

**Step 5: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/mirror-run-evidence.test.ts tests/unit/supabase-harness-observer.test.ts tests/unit/sync-harness-artifacts.test.ts
git add superpowers/integrations/supabase tests/unit/mirror-run-evidence.test.ts tests/unit/supabase-harness-observer.test.ts tests/unit/sync-harness-artifacts.test.ts
git commit -m "feat: project harness evidence to supabase"
```

---

### Task 5: Add the Node 24 Web-generation runner

**Files:**

- Create: `superpowers/runner/run-web-generation.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/unit/run-web-generation.test.ts`
- Test: `tests/unit/run-web-generation.test.ts`

**Step 1: Write the failing orchestration test**

Inject database, preflight, Harness, observer, and artifact-sync dependencies. Assert:

- UUID inputs are validated before filesystem paths are built.
- Project intake is loaded from Supabase and validated with the existing `projectInputSchema`.
- The existing live preflight runs with `strictGithubActions=true` and `authProbe=true`.
- `runGeneration` receives the database run UUID, mapped intake, `adapterMode=real`, and the Supabase observer.
- Both `published` and `needs_review` are accepted terminal product outcomes.
- Any other terminal state marks the row failed and rethrows.

**Step 2: Implement the runner**

Install a pinned TypeScript runtime so this cross-boundary executable can reuse the existing app schema, including its extensionless internal imports and `@/` alias, without rewriting those contracts:

```bash
npm install --save-dev --save-exact tsx@4.23.11
```

The CLI contract is:

```bash
npx tsx superpowers/runner/run-web-generation.ts --project-id 11111111-1111-4111-8111-111111111111 --run-id 22222222-2222-4222-8222-222222222222
```

The central call is:

```ts
const result = await runGeneration({
  rootDir,
  runsRoot: path.join(rootDir, ".fusera/runs"),
  runId,
  input: projectInputToHarness(intake),
  inputRef: `supabase:projects/${projectId}/intake`,
  mode: "publish",
  adapterMode: "real",
  observer
});
```

Before this call:

1. Validate IDs with `z.string().uuid()`.
2. Run `checkLiveRunner({ rootDir, strictGithubActions: true, authProbe: true })` and fail closed if `ok` is false.
3. Load and parse project intake.
4. Set `backend=codex`, `adapter_mode=real`, and the evidence prefix.

After the call:

1. Synchronize all canonical artifact envelopes.
2. Accept only `published` or `needs_review` as non-error terminal states.
3. Mirror evidence one final time.
4. On error, update `status=failed` without erasing detailed failure fields already written by the observer.

Prefer relative imports inside `superpowers/`; `tsx` is present specifically so the runner can reuse existing `src/` contracts that already depend on the project's TypeScript resolution rules.

**Step 3: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/run-web-generation.test.ts
git add superpowers/runner/run-web-generation.ts package.json package-lock.json tests/unit/run-web-generation.test.ts
git commit -m "feat: add node24 web harness runner"
```

---

### Task 6: Add the dedicated GitHub Actions execution workflow

**Files:**

- Create: `.github/workflows/web-generation.yml`
- Create: `tests/unit/web-generation-workflow.test.ts`
- Test: `tests/unit/web-generation-workflow.test.ts`

**Step 1: Write a failing static workflow contract test**

Read the YAML and assert it contains:

- `workflow_dispatch` inputs `project_id` and `run_id`.
- `runs-on: [self-hosted, fusera-live]`.
- Node 24 setup.
- The Web-generation runner command.
- `concurrency` keyed by `run_id` with cancellation disabled.
- An `if: always()` evidence upload.

**Step 2: Create the workflow**

Create `.github/workflows/web-generation.yml`:

```yaml
name: Web generation
run-name: web-generation-${{ inputs.run_id }}

on:
  workflow_dispatch:
    inputs:
      project_id:
        description: Supabase project UUID
        required: true
        type: string
      run_id:
        description: Supabase generation run UUID
        required: true
        type: string

concurrency:
  group: web-generation-${{ inputs.run_id }}
  cancel-in-progress: false

jobs:
  generate:
    runs-on: [self-hosted, fusera-live]
    timeout-minutes: 60
    permissions:
      contents: read
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      CODEX_HOME: ${{ runner.temp }}/fusera-codex-${{ github.run_id }}
      FUSERA_CODEX_ADAPTER: real
      FUSERA_CODEX_TIMEOUT_MS: "240000"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - name: Authenticate Codex for this run
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          mkdir -p "$CODEX_HOME"
          printenv OPENAI_API_KEY | codex login --with-api-key
      - name: Generate page
        run: >-
          npx tsx superpowers/runner/run-web-generation.ts
          --project-id "${{ inputs.project_id }}"
          --run-id "${{ inputs.run_id }}"
      - name: Remove temporary Codex credentials
        if: always()
        run: rm -rf "$CODEX_HOME"
      - name: Preserve secondary workflow evidence
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: web-generation-${{ inputs.run_id }}
          path: .fusera/runs/
          if-no-files-found: warn
          retention-days: 14
```

The Supabase Storage mirror is the application evidence store; the GitHub artifact is a short-lived secondary diagnostic copy.

**Step 3: Validate the real runner before wiring production traffic**

Manually dispatch the workflow with a development project/run UUID. Expected:

- Preflight reports Node >=24, Codex CLI available, and auth probe success.
- The row progresses to a terminal state.
- Evidence appears in Supabase Storage.
- The GitHub artifact remains downloadable even on failure.

If preflight fails, stop here. Do not route the product to an unproven runner.

**Step 4: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/web-generation-workflow.test.ts
git add .github/workflows/web-generation.yml tests/unit/web-generation-workflow.test.ts
git commit -m "feat: execute web harness on live runner"
```

---

### Task 7: Dispatch Web generation without creating a second runtime

**Files:**

- Create: `src/lib/harness/dispatch-web-generation.ts`
- Modify: `src/app/api/projects/[projectId]/generate/route.ts`
- Modify: `src/trigger/generate-page.ts`
- Modify: `tests/unit/generation-route.test.ts`
- Create: `tests/unit/dispatch-web-generation.test.ts`
- Create: `tests/unit/generate-page-task.test.ts`
- Test: all three files

**Step 1: Test the GitHub dispatch adapter**

Inject `fetch` and environment. Assert the adapter:

- Uses workflow `web-generation.yml`.
- Sends the configured ref, project UUID, and run UUID.
- Sends GitHub's current versioned JSON headers.
- Accepts only a successful response containing workflow run identity and URLs.
- Returns `executor_run_id`, `executor_run_url`, and `executor_html_url`.
- Never logs or returns the dispatch token.

The request body is:

```ts
JSON.stringify({
  ref: config.ref,
  inputs: {
    project_id: input.projectId,
    run_id: input.runId
  }
})
```

Use these headers:

```ts
{
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${config.token}`,
  "X-GitHub-Api-Version": "2026-03-10",
  "Content-Type": "application/json"
}
```

The endpoint is:

```ts
`https://api.github.com/repos/${owner}/${repo}/actions/workflows/web-generation.yml/dispatches`
```

Use a fine-grained token with repository Actions write permission only.

**Step 2: Move run creation into the synchronous API route**

Update `tests/unit/generation-route.test.ts` first. Assert:

- Valid stored intake creates one queued `generation_runs` row.
- The returned UUID is passed to Trigger.dev.
- The route returns `runId` and `runHandleId`.
- Trigger rejection marks that row failed and returns `502`.

The Trigger payload becomes:

```ts
await generatePageTask.trigger({
  projectId,
  runId: run.id
});
```

Successful response:

```ts
return Response.json({
  status: "queued",
  runId: run.id,
  runHandleId: handle.id
});
```

Persist `trigger_run_handle_id` after Trigger accepts the task. If only that update fails, return `202` with the run identity and log the persistence error; never enqueue a duplicate task.

**Step 3: Reduce the Trigger task to a dispatcher**

Create `tests/unit/generate-page-task.test.ts`. Assert the task never builds artifacts and never inserts a run. It calls `dispatchWebGeneration({ projectId, runId })`, then updates:

```ts
{
  executor_kind: "github-actions",
  executor_run_id: dispatch.workflow_run_id,
  executor_run_url: dispatch.html_url,
  updated_at: new Date().toISOString()
}
```

Set Trigger task retries to one attempt because the API already owns the durable run ID and the GitHub workflow has a concurrency key:

```ts
export const generatePageTask = task({
  id: "generate-page",
  retry: { maxAttempts: 1 },
  run: async (payload: { projectId: string; runId: string }) => {
    return dispatchAndPersist(payload);
  }
});
```

On dispatch failure, mark the same row failed with `failure_mode=executor_dispatch_failure` and a safe message. Remove all production imports and calls to `buildPageArtifacts`.

**Step 4: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/dispatch-web-generation.test.ts tests/unit/generation-route.test.ts tests/unit/generate-page-task.test.ts
rg -n "buildPageArtifacts" src/app src/trigger src/lib/harness
git add src/lib/harness/dispatch-web-generation.ts src/app/api/projects/[projectId]/generate/route.ts src/trigger/generate-page.ts tests/unit/dispatch-web-generation.test.ts tests/unit/generation-route.test.ts tests/unit/generate-page-task.test.ts
git commit -m "feat: dispatch web generation to live harness"
```

Expected: tests pass and the search returns no production-path match.

---

### Task 8: Expose and render generation progress

**Files:**

- Create: `src/lib/projects/load-latest-generation-run.ts`
- Create: `src/app/api/projects/[projectId]/runs/latest/route.ts`
- Create: `src/components/editor/generation-run-status.tsx`
- Modify: `src/app/projects/[projectId]/page.tsx`
- Create: `tests/unit/generation-run-status-route.test.ts`
- Create: `tests/unit/generation-run-status.test.tsx`
- Modify: `tests/unit/project-preview-loader.test.ts`
- Test: all three files

**Step 1: Add the latest-run server query and route**

Select only:

```ts
[
  "id",
  "status",
  "current_stage",
  "failed_stage",
  "failure_mode",
  "failure_message",
  "review_state",
  "export_state",
  "quality_score",
  "created_at",
  "updated_at"
].join(",")
```

Order by `created_at desc`, limit one, and return `{ run: null }` when no run exists. Validate `projectId` as a UUID. The public route must replace raw internal failure text with a safe product message while retaining `failure_mode` for UI decisions.

Test no run, queued, running, completed, failed, and invalid UUID cases.

**Step 2: Build the polling component test-first**

Create `GenerationRunStatus` as a client component. Poll every two seconds only while `queued` or `running`. Stop on `completed` or `failed`; call `router.refresh()` once on a terminal transition.

Use these stage labels:

```ts
const STAGE_LABELS: Record<string, string> = {
  "normalize-input": "整理项目信息",
  "product-and-brand-brief": "提炼产品与品牌策略",
  "page-strategy": "规划页面结构",
  "section-planning": "组织内容模块",
  "design-system-pass": "生成视觉规范",
  "design-spec-pass": "生成设计说明",
  "page-compile": "编译页面预览",
  "verify-publishable-page": "检查页面质量",
  "publish-preview": "准备可审核版本"
};
```

Terminal copy:

- `completed + review_ready`: `页面已生成，可以开始审核。`
- `completed + qa_failed`: `页面已生成，但质量检查未通过，请查看问题。`
- `failed`: `生成未完成，请重试。`

Never display “已发布” for a preview-ready run.

**Step 3: Mount it on the existing project page**

Load preview and latest run concurrently:

```ts
const [preview, latestRun] = await Promise.all([
  loadProjectPreview(projectId),
  loadLatestGenerationRun(projectId)
]);
```

Render progress near the existing preview status. Keep the current workbench and preview components unchanged. When no completed preview exists but a run is active, show progress instead of the generic empty state.

**Step 4: Verify and commit**

```bash
npx vitest run --config vitest.node.config.ts tests/unit/generation-run-status-route.test.ts tests/unit/generation-run-status.test.tsx tests/unit/project-preview-loader.test.ts tests/unit/page-preview.test.tsx
git add src/lib/projects/load-latest-generation-run.ts src/app/api/projects/[projectId]/runs/latest/route.ts src/components/editor/generation-run-status.tsx src/app/projects/[projectId]/page.tsx tests/unit/generation-run-status-route.test.ts tests/unit/generation-run-status.test.tsx tests/unit/project-preview-loader.test.ts
git commit -m "feat: show harness generation progress"
```

---

### Task 9: Remove duplicate ownership and finish operational verification

**Files:**

- Modify: `src/lib/ai/page-strategy.ts`
- Modify: `tests/unit/generate-page.test.ts`
- Modify: `README.md`
- Create: `docs/superpowers/harness/web-runtime-operations.md`
- Test: complete Node, React, Harness, and build suites

**Step 1: Isolate the legacy deterministic builder**

If `buildPageArtifacts` remains test-only, move it under `tests/fixtures/` and update tests. If a pure fixture helper is still required, rename it to `buildDeterministicPageFixture` and clearly mark it non-production. These paths must have zero imports:

```bash
rg -n "buildPageArtifacts|buildDeterministicPageFixture" src/app src/trigger src/lib/harness superpowers/runner/run-web-generation.ts
```

Expected: no output.

**Step 2: Write the operations document**

Document:

- Required Next.js/Trigger variables: Supabase credentials, `FUSERA_GITHUB_REPOSITORY`, `FUSERA_GITHUB_REF`, and the fine-grained dispatch token.
- Required GitHub secrets: Supabase URL/service role and `OPENAI_API_KEY`; authentication is written only to a run-scoped `CODEX_HOME` and removed in an `always()` step.
- Required runner properties: labels `self-hosted,fusera-live`, Node 24, Codex CLI, writable workspace, and passing auth probe.
- The difference between canonical evidence, query projections, GitHub's secondary artifact, preview-ready, exported, and externally published.
- How to inspect `generation_runs`, `generation_run_events`, `artifacts`, `run_evidence_objects`, Storage objects, and the GitHub run URL.
- Failure recovery: create a new generation run; never reuse a completed or failed run UUID.
- Rollback: restore the previous Trigger task while retaining migration 0006 and all evidence.

Update `README.md` so “current architecture” matches the shared Harness and does not use a stale branch name as runtime truth.

**Step 3: Run a development end-to-end smoke test**

Use one development project through the real UI. Verify:

- The API creates a queued UUID immediately.
- Trigger stores the GitHub executor identity.
- The live runner passes preflight and invokes the shared core.
- Events appear in order.
- Stable and rejected artifacts are both retained according to validation state.
- Storage contains `run.json`, `events.ndjson`, artifacts, compiled output, and logs.
- The project page advances without manual refresh.
- A QA pass ends at `export_ready`, never `published`.

**Step 4: Run the full local verification suite**

```bash
npm run test:node
npm run test:react
npm run harness:verify
npm run build
git diff --check
```

No Playwright run is required unless unit/component tests cannot prove the progress-to-preview transition.

**Step 5: Commit documentation and cleanup**

```bash
git add README.md docs/superpowers/harness/web-runtime-operations.md src/lib/ai/page-strategy.ts tests
git commit -m "docs: define unified web harness operations"
```

---

## 2. Acceptance criteria

Implementation is complete only when all statements are true:

1. CLI and Web-triggered generation call the same `runGeneration()` implementation.
2. Trigger.dev dispatches work but does not construct artifacts or run a weaker live environment.
3. Real Web generation runs only on a Node 24 runner that passes the canonical live preflight and Codex auth probe.
4. The Supabase generation UUID is also the Harness run UUID and GitHub concurrency key.
5. Every Web run has queryable events and a durable private evidence mirror.
6. Rejected artifacts remain persisted with validation errors and never advance latest refs.
7. The frontend shows queued, active stage, QA-failed, completed, and failed states without manual refresh.
8. Preview-ready output is never labeled as externally published.
9. Existing CLI proof, retry, resume, and Harness verification behavior remains green.
10. Node tests, React tests, Harness verification, and the Next.js production build all pass.

## 3. Deployment order

1. Validate the `fusera-live` runner and Codex auth probe.
2. Apply migration 0006 and verify the private Storage bucket.
3. Deploy `web-generation.yml` to the default branch.
4. Configure the GitHub and Trigger.dev secrets.
5. Deploy the status API and frontend polling component.
6. Deploy the Trigger dispatcher.
7. Run one controlled production project and inspect all projections before expanding traffic.

Rollback reverts only the Trigger dispatcher. Do not drop migration 0006 or delete evidence during rollback.

## 4. Deferred follow-up plans

- Real external publish/export adapters.
- Resume-from-stage for Web-triggered runs.
- Evidence retention and deletion policies.
- Replacing polling with an event transport if measurements justify it.
- Replacing the self-hosted live runner with a dedicated Node 24 worker service if product traffic outgrows GitHub Actions.
- DeerFlow or multi-agent scheduling only after a concrete serial-stage bottleneck is demonstrated.
