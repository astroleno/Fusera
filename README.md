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

Phase 1 app progress:

- Task 1 complete: Next.js App Router shell, global styles, Vitest, Playwright, build config.
- Task 2 complete: project input schema, app-side artifact envelope/payload schemas, Supabase persistence skeleton.
- Task 3 complete: `/projects/new` guided intake page and `POST /api/projects`.
- Task 4 complete: deterministic `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens` generation plus `POST /api/projects/[projectId]/generate`.

Not complete yet:

- Project preview route at `/projects/[projectId]`.
- App-side page compiler and section registry.
- Micro-adjustments and partial regeneration.
- Quality scoring and publish route.
- Full E2E flow from intake to generated preview.

## Local Commands

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
npm run test
npm run build
npm run test:e2e
node --experimental-strip-types superpowers/runner/cli.ts ci mock
```

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

Use the continuation plan for the next app-side work after Task 4. It supersedes older Task 5-8 snippets where those snippets conflict with the current strict artifact schemas or the established CSS/App Router patterns.
