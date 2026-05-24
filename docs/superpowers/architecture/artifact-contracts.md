# Artifact Contracts

Date: 2026-04-24  
Status: Background reference  
Purpose: Define schema ownership, versioning, lifecycle, and failure handling for the stable Superpowers artifacts

Source-of-truth note: Current harness contracts live under `superpowers/contracts/artifacts/`; current implementation rules live under `docs/superpowers/harness/` and `superpowers/`. This document is historical architecture background.

## 1. Decision Summary

The stable artifact spine is:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `DesignSpec`
- `PageSpec`
- `QAReport`
- `PublishVersion`

These are not informal JSON blobs.

They are versioned contracts owned by Fusera.

## 2. Canonical Artifact Envelope

Every stable artifact should carry the same top-level envelope:

```json
{
  "artifact_type": "PagePlan",
  "schema_version": "1.0.0",
  "artifact_id": "page-plan_01H...",
  "run_id": "run_01H...",
  "status": "validated",
  "producer_stage": "page-strategy",
  "input_refs": ["product-brief_01H...", "brand-profile_01H..."],
  "validation": {
    "valid": true,
    "errors": []
  },
  "payload": {}
}
```

Required envelope fields:

- `artifact_type`
- `schema_version`
- `artifact_id`
- `run_id`
- `status`
- `producer_stage`
- `input_refs`
- `validation`
- `payload`

## 3. Ownership Rules

- Fusera owns the canonical schema for every stable artifact
- each stage may create or replace only the artifacts it is responsible for producing
- downstream stages consume the declared `schema_version`, not whatever shape happens to exist
- rejected or partial artifacts remain persisted for traceability
- downstream stages may consume only artifacts whose status is explicitly allowed

## 4. Versioning Rules

Use semantic versioning on `schema_version`.

- major: breaking change to required fields, meaning, or invariants
- minor: additive fields or tighter optional structure
- patch: clarification or non-breaking validation tightening

Consumer rule:

- every consumer should declare the version range it accepts
- no stage should consume an unsupported major version silently

## 5. Artifact Status Model

Base statuses:

- `draft`
- `validated`
- `rejected`
- `superseded`

Specialized statuses:

- `QAReport.payload.verdict`: `pass`, `fail`, `waived`
- `PublishVersion`: no mutable lifecycle state inside the artifact; active-state is owned by the publish control plane

P0 consumption rule:

- planning and compile stages consume only `validated`
- publish consumes only `QAReport` artifacts whose envelope `status` is `validated`, whose `page_spec_ref` matches the `PageSpec` being published, whose `preview_build_ref` matches the verified preview build being promoted, and whose payload `verdict` is either:
  - `pass`, or
  - `waived` with explicit waiver metadata and no failed non-waivable gates

## 6. Stable Artifact Responsibilities

| Artifact | Producer | Primary Consumers | Required Invariants | Invalid or Partial Handling |
|---|---|---|---|---|
| `ProductBrief` | product and brand brief stage | strategy, design, QA | audience, value props, CTA intent, claim policy, proof inputs present or explicitly empty | persist as `rejected` with missing-field errors |
| `BrandProfile` | product and brand brief stage | design, styling, proof checks | tone, visual direction, positioning cues | persist validation errors; do not infer silently downstream |
| `PagePlan` | page strategy stage | section planning, design, QA | narrative, section order intent, CTA strategy | reject if stage goal and section intent conflict |
| `SectionGraph` | section planning stage | compiler, QA | ordered sections, allowed section types, required props, proof bindings consistent with claim policy | reject if unknown section type, missing required props, or claim policy and proof bindings conflict |
| `ThemeTokens` | design system pass | compiler, QA | color, typography, spacing, motion token sets | reject if token references are unresolved or incomplete |
| `DesignSpec` | design spec pass | compiler, QA | section-level design intents cover `SectionGraph.section_order`, claim policy matches `ProductBrief`, token directives bind to `ThemeTokens` | reject if section ids are unknown, duplicated, or omitted |
| `PageSpec` | deterministic compiler | renderer, QA, publish | compiled structure references only valid sections and tokens | reject if compile output includes unresolved component or asset refs |
| `QAReport` | verifier layer or approval flow when a waiver is recorded | repair loop, approval, publish | artifact validation status plus payload verdict, exact `PageSpec` binding, preview build binding, gate results, waiver metadata when applicable, suggested repair directives, evidence refs | failed reports stay materialized and block publish |
| `PublishVersion` | publish handoff | serving layer, rollback flow | immutable version id, source `PageSpec`, source `QAReport`, publish target, previous active pointer snapshot | failed publish creates no active pointer change |

## 7. Payload Minima

P0 should define minimum payload shape for every stable artifact even if full JSON Schemas land later.

### 7.1 `ProductBrief`

Required payload fields:

- `product_name`
- `audiences[]`
- `core_problem`
- `value_props[]`
- `cta_goal`
- `proof_inputs[]`
- `claim_policy`

Allowed `claim_policy` values:

- `proof-required`
- `low-proof`
- `no-claims`

### 7.2 `BrandProfile`

Required payload fields:

- `brand_traits[]`
- `tone_keywords[]`
- `visual_directions[]`
- `positioning`
- `do_not_use[]`

### 7.3 `PagePlan`

Required payload fields:

- `page_goal`
- `narrative_arc`
- `section_intents[]`
- `cta_strategy`
- `proof_strategy`

### 7.4 `SectionGraph`

Required payload fields:

- `nodes[]`
- `edges[]`
- `section_order[]`
- `required_props`
- `proof_bindings[]`
- `claim_policy`

`proof_bindings[]` may be empty only when `claim_policy` is `low-proof` or `no-claims`.

### 7.5 `ThemeTokens`

Required payload fields:

- `colors`
- `typography`
- `spacing`
- `radii`
- `shadows`
- `motion`

### 7.6 `DesignSpec`

Required payload fields:

- `visual_thesis`
- `brand_alignment`
- `token_directives`
- `layout_directives`
- `motion_directives`
- `section_design_intents[]`
- `claim_and_proof_constraints`
- `anti_patterns`

### 7.7 `PageSpec`

Required payload fields:

- `route_id`
- `sections[]` with `design_intent`
- `token_refs`
- `asset_refs`
- `compile_targets[]`

### 7.8 `QAReport`

Required payload fields:

- `page_spec_ref`
- `preview_build_ref`
- `verdict`
- `gate_results[]`
- `issues[]`
- `repair_directives[]`
- `evidence_refs[]`
- `waiver`

`waiver` may be `null` when `verdict` is `pass` or `fail`.

If `verdict` is `waived`, `waiver` is required.

Each `gate_results[]` entry should include:

- `gate_id`
- `result`
- `blocking`
- `waivable`
- `evidence_refs[]`

Each `issues[]` entry should include:

- `issue_id`
- `severity`
- `category`
- `repairability`
- `blocking`
- `location_ref`
- `summary`

Allowed `repairability` values:

- `machine-repairable`
- `manual-only`

Allowed `gate_results[].result` values:

- `pass`
- `fail`
- `waived`

P0 non-waivable gates:

- `artifact-binding`
- `claims-proof`
- `publish-safety`

If any failed gate has `waivable: false`, the report cannot be used for publish even if a human records a waiver.

### 7.9 `PublishVersion`

Required payload fields:

- `publish_version_id`
- `page_spec_ref`
- `qa_report_ref`
- `preview_url`
- `published_at`
- `publish_target`
- `previous_active_pointer`
- `pointer_transaction_ref`

### 7.10 Preview `PublishVersion` Semantics

P0 introduces `PublishVersion` only for preview publish.

Required rule:

- `PublishVersion.payload.publish_target` may be `preview` in P0

Preview-specific semantics:

- `previous_active_pointer` may be `null` when preview pointer management is not enabled
- `pointer_transaction_ref` may refer to a run-local preview handoff transaction rather than a serving-layer pointer transaction
- preview publish may persist a handoff record without implying production serving control-plane ownership

Production publish semantics may tighten these fields later:

- `previous_active_pointer` becomes required and non-null when switching a real active serving pointer
- `pointer_transaction_ref` must then refer to the serving-layer pointer transaction or equivalent control-plane operation

## 8. Partial And Invalid States

P0 should not hide failure by dropping bad artifacts.

Rules:

- if generation returns malformed content, store the artifact with `status: rejected`
- if validation can parse but finds missing invariants, store the artifact with explicit errors
- if a stage is skipped intentionally, record that absence in run state rather than fabricating an empty artifact

## 9. Publish Contract

`PublishVersion` should be immutable.

Required fields:

- `publish_version_id`
- `page_spec_ref`
- `qa_report_ref`
- `published_at`
- `publish_target`
- `previous_active_pointer`
- `pointer_transaction_ref`

Rollback rules:

- activating a new version should preserve the previous active version
- failed publish must leave the active pointer unchanged
- rollback should switch the active pointer back without mutating prior version records

Publish control-plane ownership:

- the active serving pointer is not stored inside `PublishVersion`
- the active serving pointer should live in a separate control-plane record owned by the serving layer
- publish should atomically create `PublishVersion`, switch the active pointer, and record a pointer transaction id
- rollback should emit a rollback action or audit record and switch the control-plane pointer back without mutating prior `PublishVersion` artifacts

Preview-scoped note:

- for `publish_target: preview`, P0 may stop at the immutable handoff artifact and preview URL without managing a serving-layer active pointer
- in that case, `previous_active_pointer` may be `null`
- `pointer_transaction_ref` may be a run-local handoff id or preview deployment transaction id

## 10. Storage Direction

P0 does not need every JSON Schema file implemented immediately, but the ownership boundary should be reserved now.

Suggested future home:

- `superpowers/contracts/artifacts/*.schema.json`

P0 persistence direction:

- persist artifact envelopes in a dedicated artifact store or table keyed by `artifact_id`
- persist `generation_runs` as run-state plus artifact refs, not inline evolving JSON blobs
- earlier phase-plan snippets that store `product_brief`, `page_plan`, `section_graph`, or `theme_tokens` inline should be treated as superseded by this contract
