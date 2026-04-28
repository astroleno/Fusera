# Reference Harness Comparison For Fusera

Date: 2026-04-24  
Status: Draft for review  
Purpose: Compare two local reference harnesses and turn the findings into a concrete adoption strategy for Fusera

## 1. Decision Summary

Fusera should use a hybrid reference strategy rather than copying either reviewed project wholesale.

The recommended split is:

- use `reference/harness/Claude-Code-Game-Studios` as the primary reference for the repo-local harness shell
- use `reference/harness/academic-research-skills` as the primary reference for artifact contracts, checkpoints, handoff schemas, and prompt-level orchestration discipline
- keep the Fusera harness thin, backend-aware, and artifact-driven
- avoid inheriting the full weight, domain assumptions, and prompt volume of either reference project

This document is an adoption strategy and blueprint.

It is not the canonical P0 implementation spec.

The implementation-facing follow-up is:

- `docs/superpowers/harness/2026-04-25-harness-doc-map.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`

In short:

- **CCGS** is the better reference for how a Claude-native harness is physically assembled in a repository
- **ARS** is the better reference for how a prompt-native system defines stages, gates, and handoff contracts

## 2. Reviewed References

### 2.1 Academic Research Skills

Reference root:

- `reference/harness/academic-research-skills`

Key observation:

- this project is primarily a Claude skill suite and protocol package
- its core value is in `SKILL.md`, agent prompts, mode registries, checkpoint design, and contract linting
- it has some scripts, but it is not a general runtime framework

Signals:

- the orchestrator explicitly describes itself as a lightweight dispatcher in `academic-pipeline/SKILL.md`
- many behaviors are defined as prompt behavior, not executed code
- state is represented through artifacts such as the Material Passport and checkpoint records

### 2.2 Claude Code Game Studios

Reference root:

- `reference/harness/Claude-Code-Game-Studios`

Key observation:

- this project is a more complete Claude Code workspace harness
- it includes root instructions, `.claude/settings.json`, hooks, rules, agents, skills, workflow catalog files, and a self-testing layer
- it is closer to a working template than a theory package

Signals:

- root `CLAUDE.md` delegates to focused docs and defines the collaboration protocol
- `.claude/settings.json` wires permissions, hook lifecycle, and status line
- orchestration skills use `Task` and `AskUserQuestion` directly
- path-scoped rules and shell hooks encode deterministic policy outside the prompt

## 3. Comparative Matrix

| Dimension | Academic Research Skills | Claude Code Game Studios | Fusera takeaway |
|---|---|---|---|
| Primary shape | prompt and skill suite | full Claude workspace template | prefer the CCGS shell shape |
| Runtime ownership | low | medium | Fusera should stay low to medium |
| Agent definitions | role prompts and stage docs | real Claude subagent files with frontmatter | copy the CCGS style |
| Skill entrypoints | strong mode design | strong slash-command workflow design | use both |
| Checkpoints and gates | very strong | moderate | adopt ARS-style explicit gates |
| Hooks and deterministic enforcement | limited | strong | adopt CCGS-style hook layer |
| Rules by path/domain | limited | strong | adopt CCGS-style rule layer |
| Artifact contracts | very strong | moderate | adopt ARS-style artifact schemas |
| State and resume model | strong | lighter session state | use ARS ideas, but simplify |
| Self-testing of skills | moderate linting | strong optional testing framework | borrow CCGS testing pattern later |
| Portability | lower, Claude-specific prompts but conceptually portable | low, strongly Claude Code specific | keep Fusera contracts backend-neutral |
| License fit | CC BY-NC 4.0 | MIT | prefer CCGS text/code patterns when reuse is direct |

## 4. What Each Project Is Best At

### 4.1 What ARS Does Better

- stage-by-stage orchestration contracts
- explicit user checkpoints and non-skippable gates
- mode registries and data access labeling
- handoff schemas between phases
- append-only audit artifacts and resume concepts
- using lint to keep prompt contracts from drifting

ARS is especially useful when Fusera needs:

- a stable artifact boundary between generation and verification
- a declared contract for what a stage is allowed to read or produce
- resumable workflows that do not depend on giant live prompts

### 4.2 What CCGS Does Better

- repo layout for a real Claude Code harness
- agent frontmatter with model, tools, memory, and delegated skills
- slash-command workflow design
- hook and permission wiring
- path-scoped rules
- a practical workflow catalog for phase detection
- optional QA infrastructure for testing skills and agents

CCGS is especially useful when Fusera needs:

- a durable repo-local operating shell
- deterministic guardrails around generation and edits
- user-facing entry skills like onboarding, status, and team orchestration

## 5. Recommended Fusera Synthesis

Fusera should not copy the whole "studio" metaphor from CCGS and should not copy the full "research pipeline" weight from ARS.

Instead, Fusera should synthesize them like this:

### 5.1 Shell From CCGS

Adopt the following ideas:

- thin root instruction file that routes into focused docs
- harness-native settings file for permissions, hooks, and status line
- a small set of subagent definitions with explicit tool and model boundaries
- narrow user-invocable skills for onboarding, generation, revise, verify, and publish
- path-scoped rules for outputs and deterministic artifact directories

### 5.2 Workflow Contracts From ARS

Adopt the following ideas:

- explicit stage model
- required human checkpoints at material transitions
- named artifacts per stage
- separate verification stage outputs from generation outputs
- append-only run ledger or passport concept for audit and resume
- contract lint for manifest and handoff consistency

### 5.3 Keep Portable Layers Backend-Neutral

Even if Claude Code is the strongest reference for the repo shell, Fusera should keep these layers backend-neutral:

- pack manifest
- artifact schemas
- stage and gate model
- capability matrix
- verifier semantics
- compiler inputs and outputs

These layers should not depend on Claude-only names such as `Task`, `AskUserQuestion`, or specific hook event names.

## 6. Recommended Minimal Fusera Harness

The minimal Fusera harness should be much smaller than CCGS.

### 6.1 P0 Files

Suggested initial shape:

```text
AGENTS.md
docs/superpowers/
  architecture/
  harness/
  research/
superpowers/
  packs/
    registry.yaml
    stage-profiles.yaml
    tasks/
      generate-landing/
        SKILL.md
      normalize-input/
        SKILL.md
      product-brief/
        SKILL.md
      brand-profile/
        SKILL.md
      page-strategy/
        SKILL.md
      section-graph/
        SKILL.md
      design-pass/
        SKILL.md
      page-compile/
        SKILL.md
    verifiers/
      publishable-page/
        SKILL.md
    deploy/
      publish-preview/
        SKILL.md
  contracts/
    artifacts/
      product-brief.schema.json
      brand-profile.schema.json
      page-plan.schema.json
      section-graph.schema.json
      theme-tokens.schema.json
      page-spec.schema.json
      qa-report.schema.json
      publish-version.schema.json
  runner/
    resolve-packs.ts
    assemble-context.ts
    compile-pack.ts
    invoke-backend.ts
    run-stage.ts
    validate-artifact.ts
    compile-page.ts
    verify-run.ts
    repair-run.ts
    publish-preview.ts
    write-run-event.ts
.fusera/
  runs/
```

Directory rule:

- `superpowers/` is the canonical authoring source
- `.fusera/` is runtime state, run output, and backend bundle territory only

### 6.2 P0 Subagents

Keep only a few role-stable workers:

- `orchestrator`
- `brand-strategist`
- `page-designer`
- `frontend-implementer`
- `verifier`

This is enough for bounded fan-out without creating a fake org chart.

### 6.3 P0 Skills

Keep only the workflows the product actually needs:

- `/start`
- `/generate-landing`
- `/revise-page`
- `/verify-page`
- `/publish-preview`

Anything more should wait until repeated demand exists.

### 6.4 P0 Stage Ownership

P0 should not have one giant generation pack owning the whole artifact chain.

The right split is:

- `generate-landing` is the workflow entry
- stage packs own stage outputs
- `stage-profiles.yaml` declares the legal stage graph, allowed outputs, verifier, backend, and next stage
- `PublishVersion` exists in P0, but only for `publish_target: preview`

### 6.5 P0 Backend Rule

P0 should be codex-first:

- `codex` is the primary backend implementation target
- `claude-code` is the compatibility target
- pack manifests and contracts stay portable
- the root structure should not be organized around `.claude/` as the primary source tree

## 7. Deterministic Layers Fusera Should Own

Fusera should fully own the following layers rather than delegating them to agents:

- artifact schema validation
- section registry and allowed output modes
- screenshot QA thresholds
- repair budget and retry policy
- publish gates
- rollback conditions
- backend capability mapping

For the landing-page path, the stable artifact spine should be:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `PageSpec`
- `QAReport`

For preview publish, P0 should also create:

- `PublishVersion`

This stays consistent with the existing architecture direction in:

- `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md`
- `docs/superpowers/architecture/backend-capability-matrix.md`
- `docs/superpowers/architecture/artifact-contracts.md`
- `docs/superpowers/harness/2026-04-25-harness-doc-map.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`

## 8. CCGS Mapping Table

The most useful CCGS to Fusera mapping is:

| CCGS element | Fusera interpretation |
|---|---|
| `.claude/settings.json` | backend adapter bundle target and policy surface, not canonical source |
| `.claude/hooks` | runner gates and deterministic lifecycle enforcement |
| `workflow-catalog.yaml` | `superpowers/packs/stage-profiles.yaml` |
| `skill-test` | pack-test and manifest-lint layer |
| `.claude/agents` | optional bounded workers, not a P0 org chart |
| slash-command workflow skills | pack-local `SKILL.md` task and verifier entrypoints |
| path-scoped rules | harness-owned output and artifact discipline rules |

## 9. What Fusera Should Avoid Copying

### 9.1 Do Not Copy From ARS

- the academic-domain prompt volume
- very large multi-stage mode matrix in MVP
- domain-specific reviewer and compliance language
- repository text under CC BY-NC terms when direct reuse is avoidable

### 9.2 Do Not Copy From CCGS

- the studio metaphor as the default mental model
- dozens of specialized agents before there is real need
- workflow sprawl with too many slash commands
- engine-specific hierarchy and domain rules that do not map to Fusera

## 10. Licensing Note

The two references differ materially in licensing posture:

- `academic-research-skills` is source-available under CC BY-NC 4.0 and is not suitable for direct commercial reuse
- `Claude-Code-Game-Studios` is MIT licensed and is much safer as a direct implementation-style reference

For Fusera:

- reuse ideas and high-level patterns from both
- prefer direct textual or structural borrowing from CCGS only after confirming the exact files being reused
- treat ARS primarily as an architectural and workflow reference, not a source of copy-paste prompt text

## 11. Recommended Next Moves

The next concrete moves should be:

1. define `superpowers/packs/registry.yaml`
2. define `superpowers/packs/stage-profiles.yaml`
3. define the P0 artifact schemas under `superpowers/contracts/artifacts/`
4. write the root `AGENTS.md` as a thin router, not a monolith
5. create the stage task packs plus `generate-landing`, `publishable-page`, and `publish-preview`
6. create the full P0 runner surface from the harness spec
7. keep `.fusera/runs/` as runtime records and compiled outputs only

## 12. Final Recommendation

If Fusera needs one reference to emulate structurally, choose:

- `reference/harness/Claude-Code-Game-Studios`

If Fusera needs one reference to emulate procedurally, choose:

- `reference/harness/academic-research-skills`

If Fusera needs the best combined answer, build this hybrid:

- **repo shell, hooks, rules, and subagent frontmatter from CCGS**
- **artifact contracts, checkpoints, and handoff discipline from ARS**

That combination fits the current Superpowers direction better than copying either system intact.

## 13. Internal References

- `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md`
- `docs/superpowers/architecture/artifact-contracts.md`
- `docs/superpowers/architecture/backend-capability-matrix.md`
- `docs/superpowers/architecture/pack-manifest-schema.md`
- `docs/superpowers/harness/2026-04-25-harness-doc-map.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`
- `reference/harness/academic-research-skills`
- `reference/harness/Claude-Code-Game-Studios`
