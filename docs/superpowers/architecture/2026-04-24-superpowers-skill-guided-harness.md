# Superpowers Skill-Guided Harness

Date: 2026-04-24  
Status: Background reference  
Purpose: Reframe the Superpowers "reusable agent-cli infra harness" as a thin, skill-guided harness for frontend, design, and page-generation workflows

Implementation note:

- for P0/P1 harness implementation, the canonical source-of-truth now lives under `docs/superpowers/harness/` and `superpowers/`
- this document remains the architecture rationale, pack-lineage, and design-source background document
- when implementation rules conflict with this document, the harness docs win

## 1. Decision Summary

Fusera should not begin by building a heavy custom agent runtime.

For the current phase, the better design is:

- external product: narrow, outcome-based, and artifact-driven
- internal system: a thin guidance harness that prepares context, selects packs, invokes best-fit agents, and enforces output contracts
- execution engines: existing agent backends such as Codex and Claude Code
- deterministic layers: bounded section registry, page compiler, screenshot QA, and publish gates

This document reinterprets the "reusable agent-cli infra harness" described in the Superpowers specs as:

- a pack registry
- a prompt/context assembler
- a backend adapter layer
- a verifier and gate layer

It is not a proposal to build a general-purpose autonomous agent platform from scratch.

## 2. Why This Direction Fits Fusera

This recommendation is consistent with the existing Superpowers assumptions:

- `docs/superpowers/specs/2026-04-20-fusera-image-to-brand-landing-design.md` already calls for controlled generation, prompt packs, skill packs, and a page compiler
- `docs/superpowers/specs/2026-04-20-fusera-master-plan.md` already treats the internal system as reusable infrastructure while keeping the public surface narrow
- `docs/fusera_os/Fusera_Skill_System_Plan.md` already argues for a lean orchestrator plus narrow child skills instead of one giant system

The key adjustment is architectural emphasis:

- previously implied reading: build a reusable agent runtime first
- recommended reading: build a reusable skill-guided workflow layer first

In other words:

- Fusera should own the workflow contract
- Fusera should not initially own the full agent execution substrate

## 3. Research Synthesis

The external research points in the same direction.

### 3.1 Skills Should Be Small, Discoverable, And Lazily Loaded

Anthropic's Claude Code docs describe skills as reusable instructions that are loaded on demand rather than always living in the main prompt, and recommend progressive disclosure with supporting files such as `commands`, `references`, `scripts`, and `assets`.

Implication for Fusera:

- do not create one huge "frontend master prompt"
- keep packs narrow and discoverable
- put long examples and templates in referenced files, not in the root routing prompt

### 3.2 Subagents Are Best For Bounded Specialization

Anthropic's subagent docs position subagents as a way to isolate context and give specialized instructions to a focused worker.

Implication for Fusera:

- use subagents for bounded fan-out work such as research, brand extraction, screenshot critique, or motion QA
- do not use subagents as the primary control plane

### 3.3 Hooks Are The Right Place For Deterministic Enforcement

Anthropic's hooks documentation explicitly frames hooks as the mechanism for deterministic control over tool use and policy checks.

Implication for Fusera:

- use hooks or runner-level checks for hard constraints
- examples: required artifacts exist, no unsupported claims, no publish without QA pass, no design output without declared design system

### 3.4 Plugins Can Bundle Skills, Commands, Hooks, And Subagents

Anthropic's plugin model bundles these elements into a portable package.

Implication for Fusera:

- the durable unit is not only a prompt file
- the durable unit is a pack that can include skill text, references, templates, hooks, and specialized workers

### 3.5 AGENTS.md Should Stay Thin

OpenAI's harness engineering guidance warns against giant instruction files and recommends a directory-like `AGENTS.md` that points to focused supporting docs. The same article also recommends moving long details into referenced documentation rather than stuffing them into one monolithic root prompt.

Implication for Fusera:

- keep root `AGENTS.md` or root pack index lean
- use it as a router and policy surface
- push long domain details into pack-specific files

### 3.6 Skills Are Now A Cross-Agent Primitive

OpenAI's Codex documentation and help center describe skills as reusable workflows or instruction bundles, and note that the open format can work across tools and the API.

Implication for Fusera:

- Fusera should optimize for pack portability across Codex and Claude Code
- pack metadata and output contracts matter more than backend-specific prose quirks

### 3.7 The Skill Standard Favors Frontmatter, Progressive Disclosure, And Companion Files

The Agent Skills specification recommends:

- YAML frontmatter for discovery
- descriptions that help routing
- progressive disclosure
- companion files for examples, templates, and scripts

Implication for Fusera:

- pack manifests should be first-class
- routing quality should come from metadata, not only from clever prompting

### 3.8 DESIGN.md Is A Useful Design-Context Artifact

Google Stitch's launch material positions `DESIGN.md` as a portable design-system artifact that AI tools can use as input context.

`reference/design/design.md-main` makes that idea operational by providing:

- a concrete `DESIGN.md` format spec
- a CLI with `lint`, `diff`, and `export`
- deterministic export paths into Tailwind and DTCG-style tokens

Implication for Fusera:

- design context should be materialized into portable artifacts
- `BrandProfile`, `ThemeTokens`, and optionally `DESIGN.md`-style exports are valuable pack inputs
- `DESIGN.md` should be treated as an optional first-class artifact boundary, not just as prompt seasoning
- the harness should eventually support deterministic `DESIGN.md` lint, diff, and export steps in its verifier and compiler-adjacent layers

### 3.9 Every Design Source Needs An Explicit Role

One trap in a reference-heavy system is soft citation:

- a repository influenced the design
- but the harness never says whether that source is operational, optional, or reference-only

For Superpowers, every top-level source under `reference/design` should be classified into one of these roles:

- adopt as a runtime pack
- mine into pack content or templates
- use as verifier or audit inspiration
- keep as reference-only

This document therefore treats source mapping as part of the architecture, not as a documentation afterthought.

## 4. Recommended Architecture

The recommended architecture is a thin guidance harness with six layers.

### 4.1 Layer A: Pack Registry

This is the heart of the system.

Each pack should declare:

- `name`
- `kind`
- `description`
- `priority`
- `selection role`
- `positive triggers`
- `negative triggers`
- `backend support`
- `capabilities required`
- `required inputs`
- `required artifacts`
- `output contract`
- `references`
- `verifier pack`
- `fallback policy`
- `parallelism policy`

Additional task-pack fields:

- `task_role`: `primary` or `auxiliary`
- `allowed_auxiliary_tasks`: explicit allowlist for primary task packs
- `stage_outputs`: the artifacts this task pack is allowed to create or replace

Suggested pack categories:

- `base/`
- `tasks/`
- `styles/`
- `modifiers/`
- `verifiers/`
- `deploy/`

P0 should also define a deterministic resolver policy.

Recommended order:

1. start from the requested stage and output mode
2. drop packs whose `negative triggers` match
3. choose the backend in this order:
   - explicit request override when compatible
   - stage-profile default backend when compatible
   - common ordered adapter preference across the remaining candidate packs
   - P0 primary backend `codex`
   - otherwise fail closed
4. drop packs whose `required inputs` are missing
5. drop packs whose `required artifacts` are missing or not consumable for this stage because of status or schema-version mismatch
6. drop packs whose `capabilities required` cannot be satisfied by the chosen backend adapter or runner
7. score the remaining packs by:
   - exact stage match
   - exact output-mode match
   - higher `priority`
   - pack preference for the chosen backend
   - stable lexical tie-break on `name`

Resolver rules:

- exactly one primary task pack must be selected for a stage
- zero or more auxiliary task packs may be selected only when the primary task pack or a stage profile explicitly lists them by name
- auxiliary task packs must be resolved after the primary task pack and execute in stable lexical order unless a stage profile specifies a stricter order
- at most one base pack and one style pack may be selected unless a specialized pack explicitly replaces that path
- modifiers may compose only when they do not declare mutual exclusion
- when no pack qualifies, the runner should use the declared `fallback policy` or fail the run before backend invocation
- when multiple packs still tie after scoring, the run should fail closed and emit a routing error rather than picking arbitrarily

P0 should ship with explicit stage profiles rather than leaving auxiliary selection to inference.

Example:

- `product-and-brand-brief` selects primary `tasks/product-brief`
- the same stage may add auxiliary `tasks/brand-profile`
- the stage profile must declare that the allowed outputs are `ProductBrief` and `BrandProfile`
- the runner should reject any auxiliary task that is not explicitly listed by the stage profile or primary manifest

The authoritative manifest and stage-profile shape should live in `pack-manifest-schema.md`.

### 4.2 Layer B: Prompt And Context Assembler

This layer is thin and mechanical.

Its job is to assemble:

- base agent behavior
- selected primary task pack
- selected auxiliary task packs
- one style pack when relevant
- optional modifiers
- current structured artifacts
- output contract
- verification rubric

It should not contain deep domain reasoning.

### 4.3 Layer C: Backend Adapters

The harness should support multiple execution engines behind one interface.

Initial adapters:

- `claude-code`
- `codex`

Each adapter should know:

- how to materialize selected packs into the backend's expected location
- how to compile a canonical pack source tree into a backend bundle root
- how to invoke the backend
- how to pass repo context and run artifacts
- how to capture outputs and errors

For P0, Fusera should choose one primary backend and treat the other as a compatibility target rather than as an equal first-class runtime from day one.

Recommended P0 stance:

- `codex` is the primary backend for repo-aware implementation, compiler integration, and QA-driven repair
- `codex` is the only adapter that must be concretely implemented in P0
- `claude-code` is the secondary backend for pack portability validation and specialized design exploration
- `claude-code` compatibility should remain a contract target in P0, not a shipping blocker for the landing-page path

Both adapters should publish the same capability classes to the runner:

- workspace read, write, and search
- shell execution
- structured artifact handoff
- image or screenshot inspection
- bounded agent fan-out
- policy and gate enforcement

If a pack depends on a non-portable capability, that dependency should be explicit in `capabilities required`, and the resolver should either:

- route to the backend that supports it
- emulate the capability at the runner layer
- or reject the run before execution

P0 also needs one explicit missing contract: a pack compiler.

The pack compiler should:

- read one canonical pack source tree
- emit a backend bundle root for the selected adapter
- materialize manifest metadata, `SKILL.md`, references, assets, hooks, and companion files into backend-specific locations
- emit a bundle manifest that the runner can audit before invocation

### 4.4 Layer D: Deterministic Artifact Layer

This layer remains fully owned by Fusera and is not delegated to agents.

It includes:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `PageSpec`
- `QAReport`
- `PublishVersion`

These artifacts are the stable spine of the system.

Each artifact should be treated as a versioned contract rather than as an informal blob.

Minimum artifact envelope:

- `artifact_type`
- `schema_version`
- `artifact_id`
- `run_id`
- `status`
- `producer_stage`
- `input_refs`
- `validation`
- `payload`

Contract rules:

- Fusera owns the canonical schema for every stable artifact
- each stage is allowed to create or replace only the artifacts it produces
- downstream stages consume explicit schema versions, not "latest shape by convention"
- invalid or partial artifacts should still be materialized with validation errors instead of being silently discarded
- breaking schema changes should require a new major `schema_version` and explicit consumer adoption

P0 field-level minima should already be fixed at the architecture layer:

| Artifact | Minimum payload fields | Producer | Primary consumers |
|---|---|---|---|
| `ProductBrief` | `product_name`, `audiences[]`, `core_problem`, `value_props[]`, `cta_goal`, `proof_inputs[]`, `claim_policy` | `tasks/product-brief` | strategy, design, QA |
| `BrandProfile` | `brand_traits[]`, `tone_keywords[]`, `visual_directions[]`, `positioning`, `do_not_use[]` | `tasks/brand-profile` | design, style selection, QA |
| `PagePlan` | `page_goal`, `narrative_arc`, `section_intents[]`, `cta_strategy`, `proof_strategy` | `tasks/page-strategy` | section planning, design, QA |
| `SectionGraph` | `nodes[]`, `edges[]`, `section_order[]`, `required_props`, `proof_bindings[]`, `claim_policy` | `tasks/section-graph` | compiler, QA |
| `ThemeTokens` | `colors`, `typography`, `spacing`, `radii`, `shadows`, `motion` | `tasks/design-pass` | compiler, QA |
| `PageSpec` | `route_id`, `sections[]`, `token_refs`, `asset_refs`, `compile_targets[]` | deterministic compiler | renderer, QA, publish |
| `QAReport` | `page_spec_ref`, `preview_build_ref`, `verdict`, `gate_results[]`, `issues[]`, `repair_directives[]`, `evidence_refs[]`, `waiver` | verifier layer or approval flow when a waiver is recorded | repair loop, approval, publish |
| `PublishVersion` | `publish_version_id`, `page_spec_ref`, `qa_report_ref`, `preview_url`, `published_at`, `publish_target`, `previous_active_pointer`, `pointer_transaction_ref` | publish handoff | serving layer, rollback |

The authoritative field definitions should live in `artifact-contracts.md`, but the runner should be implementable from the minima above without inventing new payload shape.

Canonical persistence model:

- P0 should persist artifact envelopes as first-class records keyed by `artifact_id`
- `generation_runs` should store run state and artifact refs, not evolving inline copies of `product_brief`, `page_plan`, `section_graph`, or `theme_tokens`
- older inline JSONB examples in earlier phase plans should be treated as superseded sketches, not the canonical storage contract

Proof handling must also be deterministic:

- `claim_policy` should be one of `proof-required`, `low-proof`, or `no-claims`
- `proof_bindings[]` may be empty only when `claim_policy` is `low-proof` or `no-claims`
- if `claim_policy` is `proof-required` and proof inputs are missing, the run should stop before publishable-page verification rather than inventing proof downstream

### 4.5 Layer E: Compiler And Registry

This layer remains deterministic and bounded:

- section registry
- theme engine
- page compiler
- renderer

Agent output should bias toward these artifacts, not toward arbitrary final code dumps.

This deterministic layer should also extend to specialized output families.

In addition to the default page compiler, the harness should define bounded compilers for:

- interactive prototypes
- HTML slides and narrative decks
- motion sources and rendered exports
- logo and brand-asset showcase bundles
- future app-UI screen graphs and component contracts

The principle stays the same across all of them:

- agents produce structured intermediate artifacts
- deterministic compilers turn those artifacts into runnable or exportable outputs
- verifiers judge the compiled output rather than a raw freeform dump

### 4.6 Layer F: Verifier And Gate Layer

This layer enforces quality and release safety.

It includes:

- screenshot critique
- mobile checks
- accessibility checks
- content and claim checks
- lint and test checks
- publish gate checks

When available, backend-specific hooks should run here. When unavailable, the thin runner should perform equivalent checks before marking a run complete.

P0 verifier expectations should be explicit:

- breakpoint coverage for mobile and desktop
- keyboard focus order and semantic landmarks
- touch-target and contrast thresholds
- proof or claim coverage when marketing assertions appear
- a clear verdict of `pass`, `fail`, or `waived`

`QAReport` should be a first-class contract, not just a verdict string.

Minimum `QAReport` payload:

- `verdict`: `pass`, `fail`, or `waived`
- `page_spec_ref`: the exact `PageSpec` artifact under review
- `preview_build_ref`: the exact preview build under review
- `gate_results[]`: one entry per gate such as `mobile`, `accessibility`, `claims`, `lint`, `tests`, `publish`
- `issues[]`: each issue carries `issue_id`, `severity`, `category`, `repairability`, `blocking`, `location_ref`, and `summary`
- `repair_directives[]`: bounded instructions for the next repair pass
- `evidence_refs[]`: screenshots, diff refs, or test outputs that justify the verdict
- `waiver`: nullable metadata that is required only when `verdict` is `waived`

For `QAReport`, the artifact envelope and payload serve different purposes:

- envelope `status` tells the runner whether the `QAReport` artifact itself parsed and validated correctly
- `page_spec_ref` and `preview_build_ref` tell the runner exactly which build the QA report is allowed to authorize
- payload `verdict` is the lifecycle decision field used for repair, approval, and publish gating

Repairability should also be explicit:

- machine-repairable: spacing drift, missing token usage, semantic markup fixes, bounded copy tightening, deterministic test or lint repair
- manual-only: missing proof for a claim, contradictory product strategy, unresolved brand direction, legal or trust ambiguity, missing required asset inputs

P0 waiver boundary should also be explicit:

- waiver is a manual approval path, not an automatic verifier outcome
- P0 non-waivable gates are `artifact-binding`, `claims-proof`, and `publish-safety`
- waived publish requires a recorded approver, approver role, timestamp, and reason
- the waiver approver must not be the same actor who initiated the publish request
- granting a waiver should create a new validated `QAReport` artifact with waiver metadata instead of mutating the original failed report

Executable state contract:

- `running -> verifying`: backend returned the required artifacts
- `verifying -> approved`: all required gates pass
- `verifying -> repairing`: every blocking issue is `machine-repairable` and repair budget remains
- `verifying -> needs_review`: any blocking issue is `manual-only`, the repair budget is exhausted, or publish would require a human waiver
- `repairing -> running`: runner re-invokes the backend with prior `QAReport` and explicit `repair_directives`
- `needs_review -> approved`: a human grants a valid waiver or approves a rerun result
- `approved -> publishing`: publish is requested and the latest `QAReport` is `pass` or an allowed `waived` report bound to the same `PageSpec` and preview build
- `publishing -> published`: immutable `PublishVersion` created and active pointer switched
- `publishing -> needs_review`: publish failed after approval or rollback safety is ambiguous

The full evented lifecycle and rollback semantics should live in `run-lifecycle.md`.

Publish control-plane ownership should also be explicit:

- `PublishVersion` is an immutable artifact record, not the mutable serving pointer
- the active pointer belongs to a separate publish control-plane record owned by the serving layer
- publish and rollback mutate the serving pointer, not historical `PublishVersion` artifacts

P0 repair loop:

1. verifier produces a `QAReport`
2. if the report passes, the run may advance to approval
3. if the report fails and every blocking issue is machine-repairable, the runner may execute a bounded repair pass
4. if the report fails after the repair budget is exhausted, any blocking issue is manual-only, or any failed gate needs human waiver, the run should move to manual review

Recommended P0 limits:

- maximum of 2 automated repair attempts per run
- publish blocked unless `QAReport` is `pass` or explicitly `waived` with no failed non-waivable gates
- every manual override must record a reason and actor
- every waived publish must record approver role and must bind to the same `PageSpec` and preview build that were verified
- publish must remain rollback-safe through immutable `PublishVersion` records and preservation of the previous active version

## 5. What The Harness Should Actually Own

The harness should own:

- pack selection
- capability negotiation
- context assembly
- artifact hydration
- backend invocation
- output collection
- verification orchestration
- repair budgeting
- publish rollback orchestration
- run logging

The harness should not own:

- a custom multi-turn reasoning engine
- a custom autonomous planner loop for every task
- a general-purpose agent memory system in MVP
- a replacement for Codex or Claude Code

Signals that the thin harness is no longer sufficient:

- repeated routing conflicts that cannot be resolved with manifest metadata
- repeated multi-stage repair loops that require long-lived state beyond run artifacts
- verifier outcomes that depend on implicit human memory rather than declared contracts
- backend divergence so large that pack portability becomes mostly fictional

If these appear, Fusera should graduate the specific subsystem that is failing instead of jumping immediately to a general-purpose runtime.

## 6. Pack Model For Superpowers

Superpowers should use pack composition rather than one giant orchestrator prompt.

### 6.1 Base Packs

Examples:

- `base/web-design-engineer`
- `base/interface-design`
- `base/landing-page-factory`

Responsibility:

- define the agent's role, taste bar, and default workflow

Reference lineage:

- `base/web-design-engineer` should be grounded primarily in `reference/design/web-design-skill`
- `base/interface-design` should be grounded primarily in `reference/design/claude-design-skill/repos/interface-design`
- `base/landing-page-factory` is a Fusera-native synthesis layer that consumes upstream artifacts rather than mirroring one external design repo

### 6.2 Task Packs

Examples:

- `tasks/input-normalization`
- `tasks/product-brief`
- `tasks/brand-profile`
- `tasks/page-strategy`
- `tasks/section-graph`
- `tasks/design-pass`
- `tasks/landing-page-build`
- `tasks/qa-critique`

Responsibility:

- define the exact stage goal, required inputs, and required outputs

### 6.3 Style Packs

Examples:

- `styles/premium-saas`
- `styles/editorial`
- `styles/warm-brand`
- `styles/minimal-professional`

Responsibility:

- bias the output's visual system without changing the workflow contract

Reference lineage:

- `designprompts.dev` should be mined for named visual directions and style vocabulary
- `claude-design-skill/repos/awesome-claude-design-voltagent` and other `DESIGN.md` collections should seed reusable design-system starts
- `design.md-main` should inform the shape of portable `DESIGN.md` exports once `ThemeTokens` are stabilized
- `taste-skill` should influence higher-variance and bolder visual style families

### 6.4 Modifier Packs

Examples:

- `modifiers/anti-slop`
- `modifiers/mobile-first`
- `modifiers/design-system-first`
- `modifiers/codebase-following`

Responsibility:

- add hard constraints or quality bias for a specific run

Reference lineage:

- `web-design-skill`, `huashu-design`, `impeccable`, and `taste-skill` should all contribute to `anti-slop` and quality-hardening modifiers
- `claude-design` should influence workflow modifiers such as "declare the design system before coding" and "show v0 early"
- `design.md-main` should reinforce `modifiers/design-system-first` by requiring explicit token and rationale structure before final implementation passes

### 6.5 Verifier Packs

Examples:

- `verifiers/publishable-page`
- `verifiers/ui-consistency`
- `verifiers/motion-smoothness`
- `verifiers/proof-and-claims`
- `verifiers/design-md-lint`
- `verifiers/presentation-deck-quality`

Responsibility:

- define what "done" means for the stage

Resolver rule:

- the runner should resolve exactly one verifier pack per stage boundary
- that verifier pack may internally bundle multiple deterministic checks such as responsive QA, accessibility, proof-and-claims, lint, and tests
- stage maps should therefore name one selected verifier bundle, not an open-ended list of peer verifiers

Reference lineage:

- `impeccable` should be mined heavily for UI audit and anti-pattern review criteria
- `huashu-design` should inform explicit design-review and critique outputs for rich artifacts
- `interface-design` should influence app-UI consistency verification
- `remotion-skills`, `hyperframes`, and `vibe-motion` should influence motion-oriented verification
- `design.md-main` should power deterministic `DESIGN.md` lint, diff, and export validation
- `guizang-ppt-skill` should inform deck-specific preflight, theme-rhythm, and layout-safety verification

### 6.6 Specialized Delivery Packs

Some packs should be treated as specialized delivery engines rather than generic styling layers.

Examples:

- `specialized/huashu-design`
- `specialized/magazine-web-ppt`
- `specialized/logo-identity`
- `specialized/hyperframes`
- `specialized/remotion-best-practices`
- `specialized/vibe-motion`

Responsibility:

- handle output families that need a richer delivery workflow than a normal landing-page build
- examples: hi-fi interactive prototypes, HTML slides, motion demos, MP4 or GIF exports, infographic-style artifacts

For Superpowers, `huashu-design` is especially valuable because it already bundles:

- a junior-designer workflow with early v0 exposure
- design-direction fallback and variation exploration
- brand-asset protocol
- HTML-first prototype and slide generation
- motion and export paths for MP4, GIF, and PPTX-adjacent deliverables

Other specialized packs should map as follows:

- `specialized/magazine-web-ppt` should be derived from `reference/design/guizang-ppt-skill` and own single-file editorial HTML deck workflows with constrained theme presets, layout registry, and checklist-driven QA
- `specialized/logo-identity` should be derived from `reference/design/logo-generator-skill` and own logo concepts plus showcase generation
- `specialized/hyperframes` should own HTML-to-video workflows that need a stable rendering framework
- `specialized/remotion-best-practices` should own Remotion-specific guidance where React video implementation is already the chosen path
- `specialized/vibe-motion` should cover reusable narrow motion outputs such as typer, ruler, assembly, and procedural loops

`guizang-ppt-skill` is especially useful as a harness reference because it demonstrates a very effective thin-pack pattern:

- one opinionated seed template
- a small, closed theme preset set
- a reusable layout registry
- a preflight check against supported classes
- a checklist that turns repeated design failures into deterministic QA

These specialized packs should still terminate in deterministic compilers, not in unconstrained final outputs.

Recommended mapping:

- prototype work should compile through a bounded prototype compiler
- slide work should compile through a deck compiler
- motion work should compile through a motion compiler plus export job
- logo and brand bursts should compile through an asset-bundle compiler

### 6.7 Reference-Only Sources

Not every source should become a direct runtime pack.

Some sources are better treated as methodology and workflow inputs:

- `reference/design/claude-design`
- `reference/design/claude-design-skill`

These should primarily influence:

- workflow shape
- design-system declaration discipline
- context-first generation
- `DESIGN.md` ingestion strategy

## 7. Stage Mapping For The Current Superpowers Pipeline

The current Superpowers pipeline already has a natural pack-driven structure.

| Stage | Pack Selection | Inputs | Outputs |
|---|---|---|---|
| Intake normalization | `tasks/input-normalization` | raw form inputs, assets | normalized input bundle |
| Product and brand brief | primary `tasks/product-brief` plus auxiliary `tasks/brand-profile` | normalized input bundle | `ProductBrief`, `BrandProfile` |
| Page strategy | `tasks/page-strategy` | brief artifacts | `PagePlan` |
| Section planning | `tasks/section-graph` | `PagePlan`, proof inputs | `SectionGraph` |
| Design system pass | `base/web-design-engineer`, `tasks/design-pass`, `styles/*` | brief, plan, references | `ThemeTokens`, optional `DESIGN.md` |
| Page compilation | deterministic compiler | `SectionGraph`, `ThemeTokens` | `PageSpec`, preview build |
| Critique and repair | `tasks/qa-critique` plus one selected verifier bundle | preview screenshots, `PageSpec` | `QAReport`, repair directives |
| Publish handoff | `deploy/*`, `verifiers/publishable-page` | approved draft, QA report | `PublishVersion` |

This is why the harness should stay thin:

- the structured artifacts already do most of the control work
- the pack system should guide the agents around those artifacts
- the compiler and critic layers already bound the risky parts

For adjacent output modes, the same stage map can branch into a specialized delivery path:

| Output Mode | Preferred Packs | Primary Outputs |
|---|---|---|
| Hi-fi prototype | `specialized/huashu-design`, `tasks/design-pass`, `verifiers/ui-consistency` | interactive HTML prototype, design rationale, QA notes |
| Slides / narrative deck | `specialized/huashu-design` or `specialized/magazine-web-ppt`, `tasks/design-pass`, `verifiers/presentation-deck-quality` | HTML deck, speaker notes when requested, export-ready package |
| Motion / launch demo | `specialized/huashu-design` or `specialized/hyperframes`, `verifiers/motion-smoothness` | HTML motion source, MP4, GIF, review notes |
| Logo / brand asset burst | `specialized/logo-identity`, `verifiers/proof-and-claims` | SVG concepts, showcase images, brand-asset package |
| Narrow reusable motion asset | `specialized/vibe-motion`, `verifiers/motion-smoothness` | motion source, rendered clip, QA notes |

These branches should still pass through structured intermediate artifacts before final output:

- hi-fi prototype: `PrototypeSpec` -> prototype compiler -> interactive HTML prototype
- slides: `DeckSpec` -> deck compiler -> HTML deck plus export package
- motion: `MotionSpec` -> motion compiler -> source plus rendered media
- logo burst: `BrandAssetSpec` -> asset compiler -> SVG set plus showcase bundle

For deck-specific flows, `guizang-ppt-skill` suggests one more useful constraint:

- `DeckSpec` may reference only approved layout ids and approved theme presets rather than arbitrary freeform slide structure
- the deck compiler can then target a deterministic single-file HTML output for editorial or talk-style presentations

For broader frontend coverage beyond landing pages, the harness should also reserve an `app-ui-design` mode with artifacts such as:

- `UXBrief`
- `ScreenGraph`
- `FlowSpec`
- `StateMatrix`
- `ComponentContract`
- `ThemeTokens`
- `QAReport`

## 8. Backend Role Split

The pack model should support both Claude Code and Codex, but not treat them as identical.

### 8.1 Claude Code

Use more often for:

- divergent design exploration
- skill-heavy design flows
- research fan-out
- critique and rewrite loops

### 8.2 Codex

Use more often for:

- repo-aware code integration
- compiler-facing implementation work
- multi-file refactors
- QA-driven repair passes

### 8.3 Huashu Design In The Backend Mix

`huashu-design` should not be treated as a generic always-on base pack.

It is best activated when the requested outcome is one of:

- hi-fi prototype
- slide deck
- motion piece
- infographic
- design-direction exploration
- design review with explicit visual critique output

For standard page-generation passes, `web-design-engineer` or `interface-design` should remain the default base pack. For richer presentation-oriented deliverables, `huashu-design` should be activated through `specialized/huashu-design`, not through the default page-generation base path.

### 8.4 Capability Matrix And Shared Rule

Both backends should consume the same pack contract:

- same stage inputs
- same required outputs
- same verifier expectations

Only the adapter logic and light phrasing should vary.

But portability should be defined by a capability matrix, not by hope.

This matrix is an authoring and compatibility contract.

For P0:

- the `codex` column is the only implementation requirement
- the `claude-code` column is a compatibility target for later validation
- no landing-page P0 milestone should block on cross-backend parity

P0 capability enum:

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

P0 support table:

| Capability | Codex | Claude Code | Runner emulation allowed | Resolver rule |
|---|---|---|---|---|
| `workspace.read` | required native support | required native support | no | fail closed if absent |
| `workspace.write` | required native support | required native support | no | fail closed if absent |
| `workspace.search` | required native support | required native support | no | fail closed if absent |
| `process.exec` | required native support | native or wrapped | limited | emulation only for bounded compile or export steps |
| `artifact.attach` | runner-managed | runner-managed | yes | always runner-owned |
| `image.inspect` | native or runner path | native or runner path | yes | accept either adapter or runner implementation |
| `screenshot.capture` | native or runner browser step | native or runner browser step | yes | verifiers depend on output, not source |
| `agent.spawn` | preferred when available | preferred when available | serial fallback only | packs using it must tolerate serial execution |
| `hook.enforce` | native hooks or runner gate | native hooks or runner gate | yes | policy stays harness-owned |
| `browser.automation` | optional | optional | no | only select backend-specific packs that declare it |

Rules:

- every pack should declare whether it is `portable-core`, `backend-preferred`, or `backend-specific`
- `portable-core` packs may depend only on capabilities guaranteed by both adapters or emulated by the runner within the table above
- `backend-preferred` packs may prefer one adapter but must declare a fallback or failure mode
- `backend-specific` packs must not be selected unless the resolver can satisfy their capability requirements directly
- the runner must not silently emulate capabilities outside the matrix; unsupported requests should fail at resolution time

The operational adapter table should live in `backend-capability-matrix.md`.

### 8.5 P0 Backend Strategy

P0 should optimize for one backend that can ship the first deterministic loop.

Recommended strategy:

- implement the runner and core pack contract against `codex` first
- keep `claude-code` compatibility in scope for validation and specialized design exploration
- treat cross-backend parity as a measured milestone, not as an assumption

Evidence that would justify promoting both backends to equal first-class status later:

- the same pack family runs cleanly on both adapters across repeated trials
- verifier outcomes stay materially consistent across both backends
- the portability benefit outweighs adapter maintenance cost

## 9. Root Instruction Strategy

The root instruction surface should stay small.

Recommended shape:

- root `AGENTS.md`: routing rules, repo-wide constraints, where to find packs
- per-pack `SKILL.md`: narrow instructions for one unit of work
- `references/`: examples, templates, rubric details
- `assets/`: output templates and checklists

This keeps the system aligned with both OpenAI's guidance on layered harness docs and Anthropic's guidance on progressive disclosure for skills.

## 10. Relation To Fusera OS

`docs/fusera_os/` and `docs/superpowers/` should not be collapsed into one layer.

Recommended split:

- `docs/fusera_os/`: business automation, research, memory, workflow operations
- `docs/superpowers/`: frontend, design, page generation, compiler, preview, QA, publish packs

This avoids one very large orchestrator trying to own both:

- overseas research and operating workflows
- frontend and design generation workflows

The two systems can still share conventions:

- YAML metadata
- durable artifact contracts
- lean orchestrator patterns
- narrow child packs

## 11. Proposed Repository Shape

This document does not require immediate implementation, but the target shape should look like this:

```text
docs/
  superpowers/
    architecture/
      2026-04-24-superpowers-skill-guided-harness.md
      pack-manifest-schema.md
      artifact-contracts.md
      run-lifecycle.md
      backend-capability-matrix.md
      frontend-output-modes.md
superpowers/
  contracts/
    artifacts/
  packs/
    base/
      web-design-engineer/
      interface-design/
      landing-page-factory/
    tasks/
      input-normalization/
      product-brief/
      brand-profile/
      page-strategy/
      section-graph/
      design-pass/
      design-token-export/
      qa-critique/
    styles/
      premium-saas/
      editorial/
      warm-brand/
    modifiers/
      anti-slop/
      mobile-first/
      design-system-first/
    verifiers/
      publishable-page/
      ui-consistency/
      design-md-lint/
      presentation-deck-quality/
      proof-and-claims/
    specialized/
      huashu-design/
      magazine-web-ppt/
      logo-identity/
      hyperframes/
      remotion-best-practices/
      vibe-motion/
  adapters/
    codex/
    claude-code/        # deferred compatibility target; not required in P0
  runner/
    resolve-packs.ts
    assemble-context.ts
    invoke-backend.ts
    verify-run.ts
    publish-version.ts
    collect-outputs.ts
```

Two implementation notes:

- packs should be authored once and then mirrored into backend-specific skill locations if needed
- pack authoring source should live outside `docs/`; `docs/` should remain architecture and specification territory

## 12. P0 Implementation Recommendation

The first implementation pass should stay deliberately small.

### P0.1 Create The Pack Contract And Resolver

Define a single manifest shape for all Superpowers packs and a deterministic resolver order for tie-breaks, fallbacks, and backend capability checks.

### P0.2 Create The Artifact Contracts

Define the initial schema envelopes, status model, and versioning policy for:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `PageSpec`
- `QAReport`
- `PublishVersion`

### P0.3 Choose The Primary Backend And Capability Matrix

Lock the P0 primary backend, document the portable capability set, and gate pack authoring against that matrix.

### P0.4 Create The Initial Pack Set

Start with:

- `base/web-design-engineer`
- `tasks/product-brief`
- `tasks/brand-profile`
- `tasks/page-strategy`
- `tasks/design-pass`
- `modifiers/anti-slop`
- `verifiers/publishable-page`

### P0.5 Build A Thin Runner

The runner should only:

- choose backend
- resolve packs deterministically
- materialize selected packs
- write a run brief
- write an output contract
- invoke the backend
- collect outputs into the run directory

### P0.6 Keep The Executable Scope Narrow

P0 should explicitly stop at:

- `landing-page` output mode
- one implemented adapter: `codex`
- one selected verifier bundle per stage boundary
- page-generation artifacts only

P0 should explicitly defer to P1:

- equal-first-class `claude-code` runtime support
- prototype, slides, motion, logo-burst, and `app-ui-design` delivery paths
- specialized delivery compilers beyond the default page compiler

### P0.7 Keep The Compiler And QA Outside The Pack Logic

Do not push the section registry, compiler, or screenshot scorer into freeform prompt logic.

P0 may stub specialized compilers, but their boundaries should be declared now so those outputs do not regress into pure prompt output later.

### P0.8 Add Deterministic Gates, Repair Budget, And Rollback

Start with simple gates:

- required artifacts present
- no publish without QA artifact
- no missing proof inputs when claims are present
- no unchecked final draft
- maximum of 2 automated repair attempts
- immutable `PublishVersion` records with previous-version rollback

## 13. Final Recommendation

For Superpowers, the right interpretation of "harness" is:

- not a general agent platform
- not a pure prompt library
- not a pure template compiler

It should be a thin guidance harness that sits between:

- portable packs and artifacts on one side
- powerful existing agent backends on the other side

That gives Fusera the right tradeoff for the current phase:

- strong reuse
- low implementation weight
- backend portability
- controlled quality
- room to evolve later into a richer system if real demand appears

## 14. External References

- Anthropic Claude Code skills: [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)
- Anthropic Claude Code subagents: [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)
- Anthropic Claude Code hooks: [https://code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)
- Anthropic Claude Code plugins: [https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)
- OpenAI harness engineering: [https://openai.com/index/harness-engineering/](https://openai.com/index/harness-engineering/)
- OpenAI Codex use cases: [https://developers.openai.com/codex/use-cases](https://developers.openai.com/codex/use-cases)
- OpenAI skills in ChatGPT and Codex: [https://help.openai.com/articles/20001066-skills-in-chatgpt](https://help.openai.com/articles/20001066-skills-in-chatgpt)
- OpenAI skills repository: [https://github.com/openai/skills](https://github.com/openai/skills)
- Agent Skills specification: [https://agentskills.io/specification](https://agentskills.io/specification)
- Google Stitch launch material: [https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)

## 15. Internal References

- `docs/superpowers/specs/2026-04-20-fusera-image-to-brand-landing-design.md`
- `docs/superpowers/specs/2026-04-20-fusera-master-plan.md`
- `docs/superpowers/plans/2026-04-20-fusera-v1-phase-1-implementation-plan.md`
- `docs/superpowers/architecture/pack-manifest-schema.md`
- `docs/superpowers/architecture/artifact-contracts.md`
- `docs/superpowers/architecture/run-lifecycle.md`
- `docs/superpowers/architecture/backend-capability-matrix.md`
- `docs/superpowers/architecture/frontend-output-modes.md`
- `docs/fusera_os/Fusera_OS_Skills_Agents_Spec.md`
- `docs/fusera_os/Fusera_Skill_System_Plan.md`
- `reference/design/claude-design/Design-with-Claude.md`
- `reference/design/claude-design/Claude-Design-help.md`
- `reference/design/claude-design-skill/README.md`
- `reference/design/claude-design-skill/USAGE.md`
- `reference/design/claude-design-skill/repos/interface-design/README.md`
- `reference/design/claude-design-skill/repos/awesome-claude-design-voltagent/README.md`
- `reference/design/designprompts.dev/saas.md`
- `reference/design/designprompts.dev/bauhaus.md`
- `reference/design/design.md-main/README.md`
- `reference/design/design.md-main/docs/spec.md`
- `reference/design/design.md-main/packages/cli/src/commands/lint.ts`
- `reference/design/design.md-main/packages/cli/src/commands/export.ts`
- `reference/design/guizang-ppt-skill/README.md`
- `reference/design/guizang-ppt-skill/SKILL.md`
- `reference/design/guizang-ppt-skill/references/layouts.md`
- `reference/design/guizang-ppt-skill/references/themes.md`
- `reference/design/guizang-ppt-skill/references/checklist.md`
- `reference/design/huashu-design/README.md`
- `reference/design/huashu-design/SKILL.md`
- `reference/design/huashu-design-master/README.md`
- `reference/design/hyperframes/README.md`
- `reference/design/impeccable/README.md`
- `reference/design/logo-generator-skill/README.md`
- `reference/design/logo-generator-skill/SKILL.md`
- `reference/design/remotion-skills/skills/remotion/SKILL.md`
- `reference/design/taste-skill/README.md`
- `reference/design/taste-skill/skills/taste-skill/SKILL.md`
- `reference/design/vibe-motion/README.md`
- `reference/design/web-design-skill/README.md`
- `reference/design/web-design-skill/.agents/skills/web-design-engineer/SKILL.md`

## 16. Reference Design Sources Matrix

The following matrix makes the source-to-role mapping explicit.

| Source | Harness Role | Use Mode | Why It Matters | Initial Adoption |
|---|---|---|---|---|
| `reference/design/claude-design` | workflow reference | reference-only | best source for context-first design workflow, iterative refinement, and product-level interaction model | P0 reference |
| `reference/design/claude-design-skill` | methodology reference | mine and reference | bridges Claude Design ideas into reusable skill patterns and points to subrepos that are directly useful | P0 reference |
| `reference/design/claude-design-skill/repos/interface-design` | `base/interface-design`, `verifiers/ui-consistency` | adopt and mine | strongest source for app UI consistency, system memory, and `system.md`-style design continuity | P0/P1 adopt |
| `reference/design/claude-design-skill/repos/awesome-claude-design-voltagent` | `styles/design-md-seed` | mine | useful for seeded `DESIGN.md`-style brand and system starts before tokens are stabilized | P1 mine |
| `reference/design/design.md-main` | `artifacts/DESIGN.md`, `verifiers/design-md-lint`, `tasks/design-token-export` | adopt and mine | turns `DESIGN.md` from a loose idea into a concrete spec plus CLI for lint, diff, and export | P0/P1 adopt |
| `reference/design/designprompts.dev` | `styles/*` | mine | best directional source for named visual themes and style vocabulary | P1 mine |
| `reference/design/guizang-ppt-skill` | `specialized/magazine-web-ppt`, `verifiers/presentation-deck-quality` | adopt and mine | strongest source for constrained single-file editorial deck generation with reusable layouts, theme presets, and checklist-driven QA | P1 adopt |
| `reference/design/huashu-design` | `specialized/huashu-design`, `verifiers/design-review` | adopt and mine | strongest source for hi-fi prototypes, slides, motion, design-direction fallback, and rich visual critique | P1 adopt |
| `reference/design/huashu-design-master` | fallback reference | reference-only | same lineage as `huashu-design`; useful as archival backup but not necessary as a separate runtime pack | reference-only |
| `reference/design/hyperframes` | `specialized/hyperframes`, `verifiers/motion-smoothness` | adopt and mine | production-grade HTML-to-video engine for richer motion outputs | P1 adopt |
| `reference/design/impeccable` | `modifiers/anti-slop`, `verifiers/ui-audit`, `verifiers/publishable-page` | mine | strongest source for anti-pattern catalogs, UI audit criteria, and polish passes | P0/P1 mine |
| `reference/design/logo-generator-skill` | `specialized/logo-identity` | adopt and mine | clear upstream path for logo concepts, SVG output, and showcase generation inside brand workflows | P1 adopt |
| `reference/design/remotion-skills` | `specialized/remotion-best-practices`, `verifiers/motion-smoothness` | adopt and mine | best used when Remotion is the chosen technical implementation path | P1 adopt |
| `reference/design/taste-skill` | `styles/*`, `modifiers/anti-slop`, `modifiers/variance` | mine | strong source for bold visual variance, anti-generic frontend taste, and style-family experimentation | P1 mine |
| `reference/design/vibe-motion` | `specialized/vibe-motion` | adopt and mine | supplies reusable narrow motion outputs rather than a whole product-page workflow | P1 adopt |
| `reference/design/web-design-skill` | `base/web-design-engineer`, `modifiers/anti-slop` | adopt and mine | best direct source for a portable, design-forward web generation base skill | P0 adopt |

This matrix is the intended reading of "fully grounded in the design corpus":

- every top-level source is classified
- adoption is explicit rather than implied
- omission is now intentional rather than accidental
