# Superpowers Harness Doc Map

Date: 2026-04-25  
Status: Draft for implementation  
Purpose: Define the canonical documentation framework for the Superpowers harness and separate implementation-facing source-of-truth from background architecture rationale

## 1. Decision Summary

The canonical documentation entrypoint for harness work now lives under:

- `docs/superpowers/harness/`

This directory is the implementation-facing source-of-truth for:

- the P0 harness shape
- P1 Codex adapter closure status
- the stable contracts used by the harness
- the implementation order for the harness subsystem

The older documents under `docs/superpowers/architecture/` and `docs/superpowers/plans/` remain useful, but they now play narrower roles:

- `architecture/` documents are rationale, design lineage, and background system design
- the older `plans/` document is the app-delivery plan, not the canonical harness build plan

If these documents disagree, the conflict should be resolved in this order:

1. `docs/superpowers/harness/2026-04-25-harness-doc-map.md`
2. `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`
3. `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
4. current dated status documents under `docs/superpowers/harness/`
5. `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`
6. background architecture and research documents

## 2. Canonical Harness Documents

| File | Role | Canonical for |
|---|---|---|
| `docs/superpowers/harness/2026-04-25-p0-harness-spec.md` | repo-shape and system boundary spec | repository layout, stage map, pack locations, runner surface, runtime layout |
| `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md` | executable contract summary | artifact discipline, resolver rules, lifecycle transitions, QA/publish gates, waiver boundary |
| `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md` | implementation build plan | work packages, sequencing, deliverables, verification checkpoints |
| `docs/superpowers/harness/2026-04-25-harness-doc-map.md` | doc-governance layer | document roles, ownership, conflict resolution, migration rules |
| `docs/superpowers/harness/2026-04-28-p1-live-codex-status.md` | current P1 closure status | live Codex proof boundary, CLI entrypoints, canonical run evidence, next-stage backlog |

## 3. Background And Reference Documents

These documents remain important, but they are no longer the first place an engineer should start when implementing the harness.

| File | New role |
|---|---|
| `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md` | architecture rationale, design-source lineage, pack taxonomy background |
| `docs/superpowers/architecture/artifact-contracts.md` | detailed contract background that informed the harness contracts summary |
| `docs/superpowers/architecture/run-lifecycle.md` | detailed lifecycle background that informed the harness contracts summary |
| `docs/superpowers/architecture/pack-manifest-schema.md` | detailed manifest and resolver background that informed the harness contracts summary |
| `docs/superpowers/architecture/backend-capability-matrix.md` | capability background and adapter rationale |
| `docs/superpowers/research/2026-04-24-reference-harness-comparison.md` | adoption rationale from local reference harnesses |
| `docs/superpowers/plans/2026-04-20-fusera-v1-phase-1-implementation-plan.md` | app-level MVP plan; use only for product delivery work that consumes the harness, not for harness bootstrapping itself |

## 4. Design Source Coverage Rule

The design-source lineage and source-to-role mapping still live primarily in:

- `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md`

That is intentional.

The harness documents under `docs/superpowers/harness/` are implementation-facing and should stay focused on:

- what the harness must do
- where the harness code and contracts live
- how stages, packs, and artifacts are enforced

They should not duplicate the full design-corpus discussion unless the implementation behavior itself changes.

Rule:

- if a pack lineage or source-role decision changes, update the architecture lineage document first
- if that change affects implementation behavior, also update the canonical harness docs

## 5. Migration Rules

Effective with this doc set:

- new harness implementation decisions should be written in `docs/superpowers/harness/`
- new background rationale may still be written in `docs/superpowers/architecture/` or `docs/superpowers/research/`
- product-app delivery steps that depend on the harness may still live in `docs/superpowers/plans/`
- engineers should not add new implementation-only rules to the older architecture documents without also reflecting them in the harness docs

## 6. Practical Reading Order

For a new engineer implementing the harness:

1. read `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
2. read `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`
3. read `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`
4. consult `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md` only for lineage, design rationale, and pack-source background
5. consult `docs/superpowers/research/2026-04-24-reference-harness-comparison.md` only for reference-project rationale
