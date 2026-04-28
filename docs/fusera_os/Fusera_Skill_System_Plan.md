# Fusera Skill System Plan

Created: 2026-04-22  
Status: Draft  
Type: Planning Document

## Goal

Refactor the current Fusera OS documentation into a skill-standard system centered on:

- one orchestrator skill that owns routing and workflow control
- multiple child skills that handle bounded business capabilities
- parallel execution only where the workflow genuinely benefits from fan-out
- durable artifacts and memory write-back at every important handoff

The end state should be a skill architecture that follows skill best practices instead of only describing them.

## Problem Frame

The current `docs/fusera_os/` set is useful as operating documentation, but it is not yet a standards-compliant skill system.

Current gaps:

- the documents are specifications, not actual `SKILL.md` packages
- there is no per-skill directory structure
- there is no YAML frontmatter for discovery
- triggers are described, but not optimized as skill metadata
- long-form instruction text is not yet split into `references/`, `scripts/`, and `assets/`
- there is no orchestrator skill that owns routing across child skills

This means the current state is strong as architecture documentation, but weak as executable skill infrastructure.

## Desired End State

Fusera should have a new skill layer under `docs/fusera_os/skills/` with this shape:

```text
docs/fusera_os/
  README.md
  Fusera_Overseas_OS.md
  Fusera_OS_Operations_Manual.md
  Fusera_OS_Skills_Agents_Spec.md
  Fusera_OS_Research_DB_Spec.md
  Fusera_Skill_System_Plan.md
  skills/
    fusera-os-orchestrator/
      SKILL.md
      references/
      assets/
    market-scout/
      SKILL.md
      references/
      assets/
    voice-of-customer/
      SKILL.md
      references/
      assets/
    content-studio/
      SKILL.md
      references/
      assets/
    landing-page-factory/
      SKILL.md
      references/
      assets/
    knowledge-curator/
      SKILL.md
      references/
      assets/
    ops-analyst/
      SKILL.md
      references/
      assets/
    validation/
      discovery-validation.md
      logic-validation.md
      held-out-prompts.md
```

Optional later additions:

- `brand-voice/`
- `feishu-ops/`

## Core Architecture Decision

The recommended operating model is:

### 1. One Orchestrator Skill

`fusera-os-orchestrator` should be the top-level skill.

Its responsibility is:

- detect what phase of the Fusera loop the user is in
- route work to the correct child skill
- decide when parallel fan-out is allowed
- enforce write-back and handoff rules
- prevent the user from bypassing strategy, QA, or memory layers

The orchestrator skill should stay lean and mostly contain:

- routing logic
- workflow rules
- stage boundaries
- failure handling rules
- references to supporting docs

It should not carry bulky domain content directly.

### 2. Child Skills For Bounded Capabilities

Each child skill should solve one narrow, repeatable task:

- `market-scout`
- `voice-of-customer`
- `content-studio`
- `landing-page-factory`
- `knowledge-curator`
- `ops-analyst`

Each one should:

- have trigger-optimized metadata
- define a clear input contract
- define a clear output contract
- define failure behavior
- point to exact references and templates when needed

### 3. Control Plane Split

The control plane for MVP should be unambiguous:

- `fusera-os-orchestrator` is the only top-level routing skill
- `research-orchestrator` remains a specialist research controller invoked by the routing skill
- `review-miner`, `copy-strategist`, and `performance-advisor` remain bounded specialist agents
- `execution-orchestrator` is not a second top-level controller during MVP; its responsibilities are temporarily absorbed by `fusera-os-orchestrator` plus the release-stage handoff

### 4. Parallelism Rules

Parallelism should be allowed only in bounded evidence-gathering phases.

Allowed parallel fan-out:

- competitor research
- market signal collection
- review mining
- community signal collection

Default serial phases:

- brief approval
- strategy formation
- page generation
- QA
- release
- memory promotion

This keeps orchestration fast without turning core decision-making into noisy concurrency.

## Scope

### In Scope

- plan and scaffold the orchestrator skill
- define P0 child skills
- convert existing specs into skill-ready source material
- map what belongs in `SKILL.md` vs `references/` vs `assets/`
- define validation criteria for discovery and execution logic

### Out of Scope

- building every later-stage P1 skill immediately
- building all scripts up front
- replacing the OS docs with skills
- implementing agent runtime code in this planning pass

The OS docs remain valuable. The skill system should be built on top of them, not instead of them.

## Source Documents

The following files should act as planning inputs and source material:

- `docs/fusera_os/Fusera_Overseas_OS.md`
- `docs/fusera_os/Fusera_OS_Operations_Manual.md`
- `docs/fusera_os/Fusera_OS_Skills_Agents_Spec.md`
- `docs/fusera_os/Fusera_OS_Research_DB_Spec.md`

These documents should be treated as source-of-truth references for converting business logic into skill logic.

## Key Decisions

### Decision 1: Keep OS Docs and Skill System Separate

Rationale:

- OS docs are for humans and long-lived strategy
- skills are for agents and must stay lean
- merging both into one layer would make the skill context too heavy

### Decision 2: Use One Orchestrator Skill Instead of One Giant Skill

Rationale:

- discovery becomes clearer
- skills stay within reasonable size bounds
- it becomes easier to test trigger behavior
- child skills can evolve independently

### Decision 3: Keep Child Skills Narrow

Rationale:

- narrow skills are easier to discover correctly
- deterministic tasks benefit from lower degrees of freedom
- cross-skill reuse becomes easier

### Decision 4: Write Progressive Disclosure Into The Structure

Rationale:

- `SKILL.md` should stay lean
- long examples, schemas, and domain details belong in `references/`
- fragile output structures belong in `assets/`
- repetitive exact operations may later move into `scripts/`

## Target Skill Inventory

### P0 Skills

| Skill | Primary Responsibility | Why P0 |
|---|---|---|
| `fusera-os-orchestrator` | route stage-specific work and enforce workflow rules | needed to make the system coherent |
| `market-scout` | gather market, category, keyword, and competitor signals | needed before strategy |
| `voice-of-customer` | mine reviews and audience language | needed before good conversion copy |
| `landing-page-factory` | produce the actual page draft from approved brief and strategy | required by the MVP closed loop |
| `knowledge-curator` | write release learnings and promoted rules into memory | required by the MVP write-back contract |
| `content-studio` | generate campaign and support content from approved strategy | needed to operationalize outputs |
| `ops-analyst` | diagnose post-release performance and next actions | needed to close the loop |

### P1 Skills

| Skill | Primary Responsibility | Why P1 |
|---|---|---|
| `brand-voice` | enforce brand tone and proof grammar | depends on stable tone pack |
| `feishu-ops` | package reports and dashboards | depends on reporting conventions |

## Directory and File Standards

Each skill should follow:

```text
skill-name/
  SKILL.md
  references/
  assets/
  scripts/
```

Rules:

- folder name must match the skill name
- `SKILL.md` must contain YAML frontmatter
- `name` and `description` must be optimized for discovery
- `SKILL.md` should stay concise and procedural
- `references/` should be one level deep only
- `assets/` should contain templates, schemas, and reusable output structures
- `scripts/` should be used only for deterministic, fragile operations

### Metadata and Discovery Contract

Every P0 skill should start from this metadata shape:

```yaml
---
name: market-scout
description: Scans target markets, categories, keywords, and competitor signals for Fusera landing-page work. Use when the task is early-stage market discovery, keyword opportunity mapping, or competitor signal gathering for a new page angle. Do not use for review mining, page generation, QA, or post-release diagnosis.
---
```

Required metadata rules:

- `name` must exactly match the folder name
- `description` must use third-person action language
- `description` must include positive triggers
- `description` must include negative triggers
- sibling skills must explicitly say what they do not own
- `fusera-os-orchestrator` must describe routing and stage control, not deep domain execution detail

Minimum discovery checks per P0 skill:

- 3 should-trigger prompts
- 3 should-not-trigger prompts
- at least 1 overlap prompt proving why a sibling skill should not fire

### Unified Status, Artifact, and Write-back Contract

All P0 skills should share the same state vocabulary and artifact destinations.

| Status | Meaning | Primary Artifact | Write-back Path |
|---|---|---|---|
| `incomplete` | missing required input or source coverage | intake gap note or incomplete scan | `research/reports/` or intake log |
| `low-confidence` | usable signal exists but evidence is thin | evidence note with confidence flag | `research/sources/` and `research/syntheses/` |
| `provisional` | output is usable for review but cannot be promoted as default knowledge | provisional diagnosis or learning note | `research/learnings/` |
| `blocked` | the workflow must stop before the next stage | blocker record or QA failure note | `research/reports/` or release incident note |
| `approved` | stage output is accepted for downstream use | brief, strategy, draft, or release package | stage-specific destination below |
| `released` | approved output was published | release record | `research/releases/` |
| `contested` | memory claim conflicts with another claim | conflict note | `research/syntheses/` or `research/concepts/` |
| `stale` | memory exists but is past freshness threshold | stale note | original record plus freshness update |

Primary artifact destinations:

- source and evidence artifacts -> `research/sources/`
- synthesis and claim artifacts -> `research/syntheses/`
- brief and strategy artifacts -> `research/briefs/`
- release artifacts -> `research/releases/`
- learning and post-release artifacts -> `research/learnings/`

## Implementation Units

### Unit 1: Create Skill Workspace Structure

Goal:
- create the new `docs/fusera_os/skills/` workspace and initial folder structure

Files:
- create `docs/fusera_os/skills/`
- create `docs/fusera_os/skills/fusera-os-orchestrator/SKILL.md`
- create `docs/fusera_os/skills/market-scout/SKILL.md`
- create `docs/fusera_os/skills/voice-of-customer/SKILL.md`
- create `docs/fusera_os/skills/content-studio/SKILL.md`
- create `docs/fusera_os/skills/landing-page-factory/SKILL.md`
- create `docs/fusera_os/skills/knowledge-curator/SKILL.md`
- create `docs/fusera_os/skills/ops-analyst/SKILL.md`
- create `docs/fusera_os/skills/validation/`

Patterns to follow:
- concise skill structure
- exact folder-name-to-skill-name matching

Verification:
- each skill folder exists
- each folder has `SKILL.md`
- directory naming is consistent

### Unit 2: Convert Orchestrator Logic Into A Real Skill

Goal:
- define a real orchestrator skill with routing and stage control

Files:
- update `docs/fusera_os/skills/fusera-os-orchestrator/SKILL.md`
- create `docs/fusera_os/skills/fusera-os-orchestrator/references/workflow-routing.md`
- create `docs/fusera_os/skills/fusera-os-orchestrator/assets/stage-handoff-template.md`

Needs to contain:

- metadata
- routing triggers
- stage detection logic
- child-skill delegation rules
- parallelism rules
- handoff rules
- failure escalation rules

Verification:
- orchestrator metadata is precise enough to trigger correctly
- body stays lean
- references are used for bulky rules

### Unit 3: Convert P0 Skills Into Real `SKILL.md` Files

Goal:
- build standards-compliant P0 child skills from the existing spec

Files:
- `docs/fusera_os/skills/market-scout/SKILL.md`
- `docs/fusera_os/skills/voice-of-customer/SKILL.md`
- `docs/fusera_os/skills/content-studio/SKILL.md`
- `docs/fusera_os/skills/landing-page-factory/SKILL.md`
- `docs/fusera_os/skills/knowledge-curator/SKILL.md`
- `docs/fusera_os/skills/ops-analyst/SKILL.md`

Needs to contain:

- frontmatter
- trigger definition
- strict procedural instructions
- bounded scope
- explicit references to supporting files

Verification:
- skill descriptions are specific and discoverable
- each skill solves one repeatable task
- child skills do not duplicate orchestrator responsibilities

### Unit 4: Extract Bulky Content Into References And Assets

Goal:
- move bulky examples, schemas, and templates out of `SKILL.md`

Files:
- `docs/fusera_os/skills/*/references/*`
- `docs/fusera_os/skills/*/assets/*`

Candidates:

- input schema templates
- output templates
- copy structures
- page draft templates
- brief and strategy templates
- research note templates
- learning note templates

Verification:
- each `SKILL.md` remains concise
- references are directly linked from `SKILL.md`
- assets reflect deterministic output structures

### Unit 5: Discovery Validation

Goal:
- ensure each skill is discoverable for the right prompts and ignored for the wrong ones

Files:
- create `docs/fusera_os/skills/validation/discovery-validation.md`

Needs to validate:

- positive triggers
- negative triggers
- metadata ambiguity
- overlap between orchestrator and child skills
- held-out prompts not used during metadata drafting

Verification:
- each P0 skill has example should-trigger and should-not-trigger prompts
- each P0 skill has a held-out prompt set stored in `skills/validation/held-out-prompts.md`

### Unit 6: Logic Validation

Goal:
- ensure the skill steps do not force hallucination or ambiguous execution

Files:
- create `docs/fusera_os/skills/validation/logic-validation.md`

Needs to validate:

- step-by-step execution simulation
- blocker identification
- missing references
- unclear handoffs
- correct artifact destination
- correct status assignment on failure and success

Verification:
- each P0 skill has at least one simulated execution pass
- each P0 skill can map outputs to a write-back path without inventing one

## Dependencies

| Dependency | Why It Matters |
|---|---|
| `docs/fusera_os/Fusera_Overseas_OS.md` | source-of-truth for workflow and scope |
| `docs/fusera_os/Fusera_OS_Operations_Manual.md` | stage-by-stage operating logic |
| `docs/fusera_os/Fusera_OS_Skills_Agents_Spec.md` | initial contracts for P0 skills and agents |
| `docs/fusera_os/Fusera_OS_Research_DB_Spec.md` | memory and write-back rules |

## Risks

### Risk 1: The Orchestrator Becomes Too Large

Mitigation:
- keep it focused on routing and handoff rules only
- push bulky logic into child skills and references

### Risk 2: Child Skills Overlap Too Much

Mitigation:
- keep one main job per skill
- explicitly define boundaries and handoff order

### Risk 3: Metadata Is Too Broad

Mitigation:
- run discovery validation
- include negative triggers

### Risk 4: `SKILL.md` Becomes Too Human-Oriented

Mitigation:
- rewrite for agents, not for humans
- prefer procedural steps over explanation

### Risk 5: Parallelism Creates Noise

Mitigation:
- allow fan-out only for evidence gathering
- keep strategy and release serial

## Proposed Sequence

Recommended order of execution:

1. create the skill workspace structure
2. build the orchestrator skill shell
3. build `market-scout`
4. build `voice-of-customer`
5. build `landing-page-factory`
6. build `knowledge-curator`
7. build `content-studio`
8. build `ops-analyst`
9. extract references and assets
10. run discovery validation
11. run logic validation
12. decide whether to promote remaining P1 skills next

## Done Criteria

This plan is complete when:

- there is one orchestrator skill and all P0 child skills in standards-compliant directories
- every skill has valid frontmatter and clear trigger text
- every P0 skill has explicit negative triggers
- bulky content is moved into `references/` and `assets/`
- status and artifact paths are consistent across the system
- validation documents exist for discovery and logic testing
- the skill system clearly maps to the Fusera v0/MVP loop

## Immediate Next Step

After plan approval, the next implementation pass should create:

- `docs/fusera_os/skills/fusera-os-orchestrator/`
- `docs/fusera_os/skills/market-scout/`
- `docs/fusera_os/skills/voice-of-customer/`
- `docs/fusera_os/skills/landing-page-factory/`
- `docs/fusera_os/skills/knowledge-curator/`
- `docs/fusera_os/skills/content-studio/`
- `docs/fusera_os/skills/ops-analyst/`
- `docs/fusera_os/skills/validation/`

and then author the first real `SKILL.md` files in that order.
