# Backend Capability Matrix

Date: 2026-04-24  
Status: Background reference  
Purpose: Define the portable capability surface for Superpowers adapters and the P0 backend strategy

Source-of-truth note: Current adapter behavior lives under `superpowers/adapters/`; current implementation rules live under `docs/superpowers/harness/` and `superpowers/`. This document is historical architecture background.

## 1. Decision Summary

Superpowers should not assume that all backends are equal.

P0 strategy:

- `codex` is the primary backend
- `claude-code` is the compatibility target and specialized design exploration backend

This is a harness decision, not a claim about vendor product parity.

P0 implementation boundary:

- only the `codex` adapter must be concretely implemented for the first landing-page path
- the `claude-code` column in this document defines compatibility expectations, not a same-milestone implementation requirement
- no P0 deliverable should block on cross-backend parity

## 2. Capability Enum

P0 capability ids:

- `workspace.read`
- `workspace.write`
- `workspace.search`
- `process.exec`
- `artifact.attach`
- `image.inspect`
- `screenshot.capture`
- `agent.spawn`
- `hook.enforce`
- `browser.automation`

These ids should be referenced directly from pack manifests.

## 3. Capability Tiers

### Tier A: Portable Core

Packs in this tier may run on any supported backend because the capability is guaranteed directly or emulated by the runner.

### Tier B: Backend-Preferred

These capabilities may be stronger on one backend, but the run can still proceed if the resolver chooses that backend or the runner provides a fallback.

### Tier C: Backend-Specific

These capabilities are not portable and must be explicitly declared in the manifest.

## 4. Capability Matrix

| Capability | Tier | Codex adapter strategy | Claude adapter strategy | Runner emulation boundary | Failure rule |
|---|---|---|---|---|---|
| `workspace.read` | A | native adapter requirement | native adapter requirement | none | fail closed if missing |
| `workspace.write` | A | runner-managed for artifact persistence | future runner/adapter decision | validated artifacts are written by the runner | fail if a pack requires unrestricted workspace mutation |
| `workspace.search` | A | native adapter requirement | native adapter requirement | none | fail closed if missing |
| `process.exec` | A | runner-managed for harness-owned commands | future runner/adapter decision | only bounded compile, lint, export, and inspect steps | fail if pack expects unrestricted shell behavior |
| `artifact.attach` | A | runner-managed | runner-managed | always runner-owned | fail if backend-specific attachment semantics are required |
| `image.inspect` | A | adapter or runner path | adapter or runner path | runner may supply screenshots or local image refs | fail only if neither adapter nor runner can inspect evidence |
| `screenshot.capture` | B | adapter path or runner-owned browser step | adapter path or runner-owned browser step | runner may capture preview pages only | fail if pack requires arbitrary authenticated browsing not declared elsewhere |
| `agent.spawn` | B | experimental; unavailable for P0 routing | future bounded fan-out only | serial runner is the only P0 path | fail closed until child attempt contracts and join validation exist |
| `hook.enforce` | B | adapter hooks or runner-owned gate step | adapter hooks or runner-owned gate step | runner owns final decision and logging | fail if required policy cannot be enforced deterministically |
| `browser.automation` | C | only if the selected adapter path supplies it | only if the selected adapter path supplies it | no generic runner emulation in P0 | fail closed when backend path lacks it |

## 5. Pack Authoring Rules

- `portable-core` packs may depend only on Tier A capabilities
- `backend-preferred` packs may depend on Tier B capabilities if they declare preferred adapters and fallback behavior
- `backend-specific` packs may depend on Tier C capabilities and must fail closed when routed to the wrong adapter

Operational resolver rules:

- manifests should list exact capability ids, not prose descriptions
- the resolver should evaluate capabilities before backend invocation
- the runner may emulate only the boundaries listed in the matrix
- any capability outside this matrix requires a matrix change before pack adoption

## 6. Why Codex Is Primary In P0

Recommended reasons for P0:

- repo-aware implementation and repair are part of the first deterministic loop
- the initial harness work is compiler-facing and multi-file
- a single primary backend lowers pack-authoring ambiguity while contracts stabilize

This does not prevent validating pack portability against `claude-code`.

It only prevents early equal-first-class abstraction from becoming the default assumption.

## 7. Promotion Criteria For Equal First-Class Support

Promote both adapters to equal first-class status only when:

- the same portable-core packs run cleanly on both adapters
- verifier outcomes stay materially consistent
- pack manifests stop accumulating backend-specific escape hatches
- adapter maintenance cost remains justified by real product value
