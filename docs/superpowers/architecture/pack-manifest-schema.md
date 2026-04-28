# Pack Manifest Schema

Date: 2026-04-24  
Status: Background reference  
Purpose: Define the canonical manifest shape and deterministic resolver contract for Superpowers packs

Source-of-truth note: Current pack manifests and stage profiles live under `superpowers/packs/`; current implementation rules live under `docs/superpowers/harness/` and `superpowers/`. This document is historical architecture background.

## 1. Decision Summary

Every runtime pack should have one canonical manifest.

This manifest is the source of truth for:

- routing
- capability checks
- backend compatibility
- output expectations
- fallback behavior
- verifier linkage
- stage ownership boundaries

P0 should not rely on prompt text alone to decide which pack to load.

P0 also requires one canonical stage profile file:

- `superpowers/packs/stage-profiles.yaml`

## 2. Canonical Fields

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | stable identifier such as `tasks/page-strategy` |
| `kind` | yes | one of `base`, `task`, `style`, `modifier`, `verifier`, `deploy`, `specialized` |
| `description` | yes | short routing-oriented summary |
| `priority` | yes | deterministic tie-break integer; higher wins |
| `selection_role` | yes | `primary`, `auxiliary`, `composable`, or `replacement` depending on pack kind |
| `stage` | yes | workflow stage this pack participates in |
| `output_modes` | yes | supported output families such as `landing-page`, `app-ui-design`, `slides`, `motion` |
| `positive_triggers` | yes | phrases, conditions, or signals that make the pack eligible |
| `negative_triggers` | yes | exclusion conditions that make the pack ineligible |
| `backend_support` | yes | `portable-core`, `backend-preferred`, or `backend-specific` plus allowed adapters and ordered adapter preference |
| `capabilities_required` | yes | runner or adapter capabilities that must exist before selection |
| `required_inputs` | yes | external inputs the pack needs from the request |
| `required_artifacts` | yes | upstream artifact descriptors with required type, allowed statuses, and accepted schema versions |
| `produces_artifacts` | yes | artifacts the pack is expected to output |
| `output_contract` | yes | structured result contract or schema reference |
| `verifier_pack` | no | verifier to run after this pack or stage |
| `fallback_policy` | yes | what the resolver should do when the pack is unavailable |
| `parallelism_policy` | yes | whether the pack may run alone, fan out, or join a bounded parallel group |
| `references` | no | upstream docs, templates, assets, or examples |

Additional task-pack fields:

| Field | Required | Meaning |
|---|---|---|
| `task_role` | yes for `task` packs | `primary` or `auxiliary` |
| `allowed_auxiliary_tasks` | yes for primary `task` packs | explicit allowlist of auxiliary task pack names |
| `stage_outputs` | yes for `task` packs | artifacts this task may create or replace |

Ownership rule:

- `stage_outputs` must be a subset of the owning stage profile's `allowed_outputs`
- a task pack must not emit any stable artifact outside `stage_outputs`
- workflow entry packs may orchestrate stages but must not claim ownership of stable artifacts unless they are also the declared stage task

## 3. Composition Rules

The resolver should enforce these invariants:

- exactly one primary `task` pack per stage
- zero or more auxiliary `task` packs only when explicitly allowed by the selected primary task pack or a stage profile
- at most one `base` pack unless a `specialized` pack replaces the base path
- at most one `style` pack unless the mode explicitly supports layered style composition
- any number of `modifier` packs only if they do not declare mutual exclusion
- exactly one `verifier` pack per stage boundary

Stage ownership invariants:

- every stage with stable outputs must have a stage profile
- every stage profile must declare exactly one `primary_task`
- every stable artifact may have only one producer stage in the stage profile set
- no selected task pack may produce an artifact not allowed by the selected stage profile

Verifier note:

- a verifier pack is a wrapper bundle, not necessarily a single atomic check
- one selected verifier pack may internally run multiple deterministic checks such as responsive QA, accessibility, proof-and-claims, lint, and tests

If composition would violate these rules, the run should fail closed with a routing error.

## 4. Resolver Algorithm

P0 resolver order:

1. load the stage profile for the requested `stage`
2. filter by requested `stage`
3. filter by requested `output_mode`
4. remove any pack whose `negative_triggers` match
5. choose the adapter for the run using this precedence:
   - explicit request override if compatible with the stage and all mandatory packs
   - `default_backend` from the stage profile if compatible
   - first common adapter from the remaining candidates' ordered `preferred_adapters` lists
   - P0 primary backend `codex` if still compatible
   - otherwise fail closed with an adapter resolution error
6. remove any pack whose `required_inputs` are missing
7. remove any pack whose `required_artifacts` are missing, have a disallowed status, or fall outside the accepted `version_range`
8. remove any pack whose `capabilities_required` cannot be satisfied by the chosen adapter or the runner
9. constrain candidates so only:
   - the stage profile's `primary_task`
   - tasks listed in `allowed_auxiliary_tasks`
   - the stage profile's `default_verifier`
   are eligible for that stage
10. sort remaining candidates by:
   - exact output-mode match over wildcard support
   - higher `priority`
   - pack preference for the chosen adapter
   - stable lexical order on `name`

Resolver outcomes:

- one winner: select it
- zero winners: use `fallback_policy`
- multiple winners with identical score: fail the run and emit a deterministic routing error

Resolver must fail closed when:

- the stage profile is missing
- the declared `primary_task` cannot be resolved
- a candidate pack's `stage_outputs` exceed the stage profile's `allowed_outputs`

## 5. Stage Profiles

P0 should define stage profiles in:

- `superpowers/packs/stage-profiles.yaml`

Stage profiles are the stage-level companion contract to pack manifests.

They are the source of truth for:

- primary stage ownership
- allowed auxiliary work
- allowed stage outputs
- default verifier
- default backend
- deterministic stage transitions

Minimum stage profile fields:

- `stage`
- `primary_task`
- `allowed_auxiliary_tasks`
- `allowed_outputs`
- `default_verifier`
- `default_backend`
- `next_stage`

Stage profile rules:

- `primary_task` must point to one concrete pack id
- `allowed_auxiliary_tasks` must be explicit
- `allowed_outputs` must list every stable artifact the stage may create or replace
- `default_verifier` may be `none` only for non-boundary stages
- `next_stage` must be explicit even when terminal
- stage transitions belong to the stage profile, not to freeform prompt prose

Example:

```yaml
stage: product-and-brand-brief
primary_task: tasks/product-brief
allowed_auxiliary_tasks:
  - tasks/brand-profile
allowed_outputs:
  - ProductBrief
  - BrandProfile
default_verifier: none
default_backend: codex
next_stage: page-strategy
```

## 6. Fallback Policy

Allowed P0 fallback policies:

- `mode: fail`: stop before backend invocation
- `mode: use-default` with `pack_name`: switch to a named default pack
- `mode: defer-to-human`: move the run to manual review

P0 should not allow silent "best effort" fallback.

## 7. Example Manifest

```yaml
name: tasks/design-pass
kind: task
description: Generate the design-system pass for landing-page and app-ui runs.
priority: 80
selection_role: primary
stage: design-system-pass
output_modes:
  - landing-page
  - app-ui-design
positive_triggers:
  - needs design direction
  - needs theme tokens
negative_triggers:
  - request is publish-only
backend_support:
  tier: portable-core
  adapters:
    - codex
    - claude-code
  preferred_adapters:
    - codex
    - claude-code
capabilities_required:
  - workspace.read
  - workspace.write
  - image.inspect
required_inputs:
  - normalized_input_bundle
required_artifacts:
  - artifact_type: ProductBrief
    allowed_statuses:
      - validated
    version_range: "^1.0.0"
  - artifact_type: BrandProfile
    allowed_statuses:
      - validated
    version_range: "^1.0.0"
produces_artifacts:
  - ThemeTokens
task_role: primary
allowed_auxiliary_tasks: []
stage_outputs:
  - ThemeTokens
output_contract: contracts/artifacts/theme-tokens.schema.json
verifier_pack: verifiers/ui-consistency
fallback_policy:
  mode: fail
parallelism_policy:
  mode: serial
references:
  - reference/design/web-design-skill
```

## 8. Implementation Notes

- author manifests once in the pack source tree
- compile canonical pack sources into backend-specific bundle roots before invocation
- generate backend-specific views from the manifest when needed
- treat routing metadata as code-reviewable architecture, not as incidental prompt prose
