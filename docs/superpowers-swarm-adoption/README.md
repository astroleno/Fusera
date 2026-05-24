# Superpowers Swarm Adoption

This directory tracks how Fusera should adopt useful coordination patterns from
`orchestrating-swarms` without turning the Superpowers harness into a general
multi-agent runtime.

## Documents

- `adoption-points.md` lists the concrete swarm concepts worth adopting and maps
  each one onto an existing Fusera surface.
- `implementation-plan.md` sequences the implementation workstreams and
  validation gates.

## Decision Boundary

Adoption v0 is documentation and contract alignment only. It should not require
a scheduler, a persisted task queue, a stage DAG, or real bounded fan-out.

Adopt swarm ideas only when they can be represented as:

- stage profile declarations
- pack manifest metadata
- artifact contracts
- run-scoped events
- attempt-scoped evidence
- runner-owned validation, merge, retry, or publish gates

Do not adopt global `~/.codex/teams` or `~/.codex/tasks` state as canonical
Fusera runtime state.

## v0 Landing Status

The v0 landing is code-bearing contract alignment only:

- `DesignSpec` is promoted into the stable artifact spine and consumed by
  `page-compile`.
- Stable artifact pack examples use canonical envelope handoffs.
- Codex capabilities are split into runtime, runner-managed, and experimental
  groups; `agent.spawn` remains unavailable for routing.
- Run events have a typed vocabulary with v0 data-field validation, and the
  serial runner emits `stage_join_ready`, `stage_blocked`, and
  `stage_unblocked` as inspectable coordination evidence.

## Milestone Boundary

- v0 prerequisite: artifact spine cleanup is resolved by promoting `DesignSpec`
  into the stable spine.
- v0: typed stage/run coordination events, capability truthfulness, and pack
  handoff hardening.
- v1: optional non-authoritative run-scoped coordination evidence.
- v2: optional minimal DAG and bounded fan-out, only after child contracts and
  join validation are explicit.
