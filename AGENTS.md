# Fusera Harness Instructions

## Source Of Truth

- P0 harness implementation follows `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`.
- Architecture docs under `docs/superpowers/architecture/` are background references, not the primary implementation contract.
- Canonical harness source lives under `superpowers/`.

## Artifact Discipline

- Stable artifacts must use the canonical envelope and schemas in `superpowers/contracts/artifacts/`.
- Pack routing is declared in `superpowers/packs/registry.yaml`.
- Stage ownership and transitions are declared in `superpowers/packs/stage-profiles.yaml`.
- Downstream stages may consume only validated artifacts.
- Rejected artifacts must remain persisted with validation errors.

## Runtime Outputs

- `.fusera/` is runtime output only.
- Do not place canonical source, pack definitions, contracts, or adapter logic under `.fusera/`.
- Run evidence belongs under `.fusera/runs/`.

## P0 Backend

- P0 is codex-first.
- Backend-specific execution behavior belongs under `superpowers/adapters/`.
- `claude-code` compatibility is a future adapter target, not the P0 driver.

## Startup Distribution

- Startup distribution follows `docs/superpowers/harness/2026-05-05-startup-distribution-contract.md`.
- Skills-only installs are companion bundles for a local Fusera checkout, not self-contained external pack distributions.
- Copied pack files in a companion bundle are reading indexes; authoritative pack resolution remains under `superpowers/`.
