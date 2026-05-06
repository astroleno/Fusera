# Feynman-Style Startup And Companion Skills Plan

**Date:** 2026-05-05
**Last Updated:** 2026-05-06
**Status:** Decision plan, ready for implementation
**Implementation Plan:** `docs/superpowers/plans/2026-05-06-feynman-style-startup-implementation-plan.md`
**Phase:** P1 startup ergonomics, not P0 harness scope

## Goal

Give Fusera a Feynman-inspired startup surface without over-claiming distribution or backend parity:

- a first-class installed `fusera` CLI for the local harness runtime
- a reliable `doctor` that can diagnose startup problems before the TypeScript runner is required
- a companion skills bundle that Codex and Claude-style hosts can read while still depending on a local Fusera checkout

## Reviewed Decision

The reviewed direction is **conditionally shippable**.

It should proceed only with these decisions locked:

- Build a companion skills bundle, not a self-contained external pack distribution.
- Treat `codex` as the only supported runtime backend in this phase.
- Treat `claude-code` as instruction-only until a future adapter exists.
- Do not export raw `registry.yaml` as runtime-support metadata because current registry entries and pack references are not a self-contained distribution contract.
- Define `source_root` and `workspace_root` before implementing `npm link` or `skills install`.
- Normalize caller-provided relative path arguments in `bin/fusera.mjs` before delegating to the runner.
- Put bootstrap `doctor` checks in plain JavaScript before invoking `node --experimental-strip-types`.
- Compose the existing `checkLiveRunner()` path for live readiness instead of creating a weaker parallel `doctor --live` model.
- Keep the Node policy intentionally split: local startup and mock harness commands target Node `>=22.22.0`; live readiness follows `checkLiveRunner()` and currently requires Node `>=24`.
- Keep companion bundle schemas source-root-only; do not copy canonical schemas into the bundle.
- Startup verification must use a repo-external temporary git root for caller workspace checks.
- Verify the installed binary path with `npm link && fusera help && fusera doctor`, not only `npm run fusera`.

## Non-Goals

This phase does not include:

- self-contained marketplace or external pack distribution
- `opencode` installation scope
- copying `reference/**` into a skill bundle
- creating `superpowers/adapters/claude-code/`
- adding `FUSERA_BACKEND=claude-code`
- making the existing runner generally workspace-root aware; this phase normalizes caller-provided path arguments in the wrapper instead

## Root Semantics

Implementation must preserve two roots:

```text
source_root    -> Fusera package checkout that contains superpowers/
workspace_root -> caller workspace where repo-local skills are installed
```

Rules:

- `bin/fusera.mjs` resolves `source_root` from its own installed package location.
- `workspace_root` defaults to the nearest git root from the original invocation directory, falling back to the invocation directory.
- `repo-local` skills install writes to `<workspace_root>/.agents/skills/fusera`.
- Existing harness runner commands run with cwd set to `source_root`.
- The wrapper passes `FUSERA_SOURCE_ROOT`, `FUSERA_WORKSPACE_ROOT`, and `FUSERA_INVOKE_CWD` to child commands.
- The wrapper normalizes caller-provided relative path arguments to absolute paths from `FUSERA_INVOKE_CWD` before invoking the TypeScript runner.
- Commands that need this rewrite include `run`, `proof`, `continue`, `resume`, `inspect`, `verify live-preview`, `verify live-quality`, `ci live`, and `live-stability`.
- Startup verification must exercise installed CLI behavior from a repo-external temporary git root so `workspace_root` assertions match the nearest-git-root rule.

## Companion Bundle Contract

The skills-only install creates a companion bundle.

It is intentionally not self-contained. It must point host agents back to the local Fusera checkout for runner code, pack references, artifact contracts, reference material, and runtime commands.

Copied pack `SKILL.md` files are a reading index and convenience surface only. Authoritative pack resolution must go through `source_root`; the bundle must not imply copied pack files can execute independently.

Canonical artifact schemas are source-root-only and must not be copied into the companion bundle. The manifest points to `<source_root>/superpowers/contracts/artifacts/` so there is only one authoritative contract surface.

Supported install scopes in this phase:

```text
codex-global -> ~/.codex/skills/fusera
repo-local   -> <workspace_root>/.agents/skills/fusera
```

The generated companion manifest must say:

```json
{
  "bundle_type": "fusera-companion-skills",
  "runtime_supported_backends": ["codex"],
  "instruction_only_backends": ["claude-code"]
}
```

The generated bundle must not claim `claude-code` runtime support.

## Review Finding Coverage

- `[P1] Installed CLI still breaks caller-relative paths`: resolved by wrapper-level path normalization before delegating to the source-root runner.
- `[P1] doctor weaker than canonical live check`: resolved by composing `checkLiveRunner()` for live readiness.
- `[P1] missing codex crashes doctor`: resolved by relying on `checkLiveRunner()` structured process handling instead of a custom unsafe spawn helper.
- `[P1] companion bundle lacks stable resolution`: resolved by declaring copied pack files as a reading index and requiring source-root resolution.
- `[P1] harness startup verifier self-fails`: resolved by requiring the verifier caller workspace to be a repo-external temporary git root.
- `[P1] companion bundle copies canonical schemas`: resolved by keeping schemas source-root-only.
- `[P2] scope ambiguity`: resolved by requiring explicit `--scope` and deferring `opencode` and Claude Code runtime adapter work.

## Handoff

Implement from:

```text
docs/superpowers/plans/2026-05-06-feynman-style-startup-implementation-plan.md
```

The 2026-05-06 implementation plan owns file-by-file tasks, verification commands, and acceptance gates.
