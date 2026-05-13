# Fusera

Fusera is an AI landing-page generation product for product sellers and operators. The V1 scope is a narrow MVP: structured product intake, canonical page-generation artifacts, preview, micro-adjustments, quality scoring, and publish flow.

The repository now contains two active workstreams:

- `superpowers/`: codex-first harness runtime, artifact contracts, pack routing, deterministic preview publish gates, and live-Codex verification tooling.
- Next.js app baseline: App Router product surface, intake domain model, guided intake flow, and deterministic placeholder generation pipeline.

## Current Status

Current branch: `codex/app-baseline`

Latest implemented app commits:

- `7f20029 feat(app): scaffold fusera baseline`
- `5279d38 feat(app): add intake domain model`
- `b0fd69e feat(app): add guided intake flow`
- `cc90363 feat(app): add canonical generation pipeline`
- `bb9e317 test(app): cover generation route handoff`
- `dd4531a feat(app): add preview compiler`
- `5350afa feat(app): add artifact-backed project preview`
- `4c49e5a feat(app): start generation from intake`
- `d3edcfd feat(app): add bounded adjustment controls`
- `2f7e2b4 feat(app): add quality scoring and publish skeleton`
- `4768748 test(app): add phase 1 browser smoke`

Phase 1 app progress:

- Task 1 complete: Next.js App Router shell, global styles, Vitest, Playwright, build config.
- Task 2 complete: project input schema, app-side artifact envelope/payload schemas, Supabase persistence skeleton.
- Task 3 complete: `/projects/new` guided intake page and `POST /api/projects`.
- Task 4 complete: deterministic `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens` generation plus `POST /api/projects/[projectId]/generate`.
- Task 5 complete: generation route handoff tests cover stored intake, Trigger payload, and queued run handle response.
- Task 6 complete: app-side section registry, page compiler, and generated preview renderer.
- Task 7 complete: `/projects/[projectId]` loads latest completed artifacts and renders preview or pending state.
- Task 8 complete: intake submission creates a project, starts generation, and redirects to the project preview route.
- Task 9 complete: bounded micro-adjustment controls and regeneration API skeleton.
- Task 10 complete: deterministic quality scoring, score task skeleton, and preview-safe publish route.
- Task 11 complete: browser E2E smoke verifies intake and preview routes render locally.

Not complete yet:

- Real hosted deployment and publish record persistence.
- Real screenshot-based AI quality review.
- Fully implemented partial regeneration jobs behind micro-adjustment controls.
- Supabase-authenticated multi-user workspaces.

## Local Commands

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
npm run test
npm run build
npm run test:e2e
node --experimental-strip-types superpowers/runner/cli.ts ci mock
```

Node policy:

- Local `fusera` startup, `doctor --bootstrap-only`, and mock harness commands require Node `>=22.22.0`.
- Live Codex readiness is checked by `fusera doctor --live`, which composes the existing live-runner preflight and may require a stricter Node version. As of this plan, `checkLiveRunner()` requires Node `>=24`.

## Fusera Harness CLI

```bash
npm link
fusera doctor
fusera verify p0
fusera run mock-publish path/to/input.json
fusera inspect path/to/run-dir --json
```

The installed CLI resolves its Fusera `source_root` from the linked package. It resolves caller-provided relative paths from the directory where `fusera` was invoked before delegating to the harness runner.

## Companion Skills Install

```bash
fusera skills install --scope codex-global
fusera skills install --scope repo-local
```

`codex-global` writes to `~/.codex/skills/fusera`.

`repo-local` writes to `<workspace_root>/.agents/skills/fusera`.

The skills install is a companion bundle for a local Fusera checkout. Copied pack files are only a reading index; authoritative registry, references, contracts, and runner behavior resolve through `source_root`. Runtime execution is Codex-first. Claude Code usage is instruction-only until a future `superpowers/adapters/claude-code/` adapter exists.

The app expects Supabase credentials for real project creation and generation:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Apply the initial database schema before exercising real persistence:

```bash
supabase db push
```

## Planning Sources

- Program roadmap: `docs/superpowers/specs/2026-04-20-fusera-master-plan.md`
- Original Phase 1 executable plan: `docs/superpowers/plans/2026-04-20-fusera-v1-phase-1-implementation-plan.md`
- Current continuation plan: `docs/superpowers/plans/2026-04-29-fusera-phase-1-continuation-plan.md`
- Harness status: `docs/superpowers/harness/2026-04-28-p1-live-codex-status.md`
- **Knowledge Graph**: `graphify-out/GRAPH_REPORT.md` - 代码架构图谱

Use the continuation plan for app-side Phase 1 completion notes. It supersedes older Task 5-8 snippets where those snippets conflict with the current strict artifact schemas or the established CSS/App Router patterns.

## Knowledge Graph

This project maintains a [graphify](https://github.com/safishamsi/graphify) knowledge graph at `graphify-out/`.

### Quick Reference

- **475 code symbols** across **42 communities**
- **Core abstractions**: `verifyP0Harness()`, `verifyLiveCodexQuality()`, `resumeFailedRun()`
- **Bridge nodes**: `createCodexAdapter()`, `invokeBackend()` (cross-community connectors)

### Usage

```bash
# Explore architecture
/graphify explain "verifyP0Harness"
/graphify path "resumeFailedRun" "verifyP0Harness"
/graphify query "How does error recovery work?"
```

See [CLAUDE.md](CLAUDE.md) for detailed graph integration guidelines.
