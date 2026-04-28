# Fusera OS Skills and Agents Spec

Status: Draft v1  
Last Updated: 2026-04-22  
Document Type: Skill and Agent Specification

## 1. Purpose

This document defines the first internal automation contracts for Fusera.

It exists to prevent the team from building vague skills and agents with unclear inputs, outputs, and ownership.

## 2. Design Principles

Fusera automation should follow these rules:

1. Routing skills and controller agents coordinate; specialist agents execute bounded tasks.
2. Skills should describe repeatable business logic, not only prompts.
3. Every agent output must be written to a durable artifact.
4. No agent may publish directly without a release-stage handoff.
5. Research and VOC work can parallelize; strategy and release should remain mostly serial.
6. Tool failures must return structured reasons, never silent fallback behavior.

## 3. Discovery Metadata Contract

Every real skill must use YAML frontmatter as its discovery surface.

Minimum metadata template:

```yaml
---
name: market-scout
description: Scans target markets, categories, keywords, and competitor signals for Fusera landing-page work. Use when the task is early-stage market discovery, keyword opportunity mapping, or competitor signal gathering for a new page angle. Do not use for review mining, page generation, QA, or post-release diagnosis.
---
```

Rules:

- `name` must exactly match the folder name
- `description` must use third-person action language
- `description` must include positive triggers
- `description` must include negative triggers
- sibling skills must explicitly say what they do not own

## 4. P0 Skills

### 4.1 `fusera-os-orchestrator`

Purpose:
- detect the current stage, route work to the correct child skill, and enforce handoff and write-back rules

Trigger:
- ambiguous multi-stage request
- new run that needs stage detection
- workflow recovery after a blocked or incomplete state

Required input:
- user task or run context
- current stage artifacts
- known workflow status

Required output:
- routing decision
- next-stage instruction
- handoff package
- escalation or write-back requirement when needed

Failure policy:
- if stage context is unclear, stop and request the missing artifact or status
- do not perform deep domain work that belongs to a child skill

Handoff:
- P0 child skills
- owning human when a gate decision is required

### 4.2 `market-scout`

Purpose:
- identify viable market, category, keyword, and competitor opportunities

Trigger:
- new market exploration
- new product exploration
- weekly signal scan

Required input:
- target market
- category
- product keyword
- channel constraints

Required output:
- market scan
- keyword list
- competitor watchlist
- confidence note

Failure policy:
- if source coverage is weak, mark incomplete
- do not produce strong recommendations without evidence

Handoff:
- `research-orchestrator`
- Product Brief drafting

### 4.3 `voice-of-customer`

Purpose:
- mine reviews, community feedback, and complaints into usable conversion insight

Trigger:
- new product
- low conversion page
- repositioning effort
- copy rewrite

Required input:
- ASIN or product review set
- category reviews or community feedback
- product context

Required output:
- pain-point map
- objection matrix
- trust phrases
- language bank

Failure policy:
- sparse review coverage means low-confidence output
- do not claim broad market truth from narrow evidence

Handoff:
- `copy-strategist`
- Product Brief

### 4.4 `content-studio`

Purpose:
- turn approved strategy into reusable campaign and support content

Trigger:
- approved page strategy
- launch prep
- campaign expansion

Required input:
- Page Strategy
- brand tone
- content objective

Required output:
- copy variants
- FAQ pack
- campaign assets
- reuse-ready snippets

Failure policy:
- if strategy is missing, block generation
- do not improvise strategy inside the skill

Handoff:
- generation package
- campaign workflow

### 4.5 `ops-analyst`

Purpose:
- explain what changed after release and what should happen next

Trigger:
- KPI drop
- experiment end
- weekly performance review

Required input:
- release record
- page metrics
- experiment or test data

Required output:
- diagnosis
- issue ranking
- next-action plan

Failure policy:
- if data freshness is low, produce provisional diagnosis only

Handoff:
- weekly review
- Learning Note

### 4.6 `landing-page-factory`

Purpose:
- produce the actual landing-page draft from approved brief and strategy

Trigger:
- approved Page Strategy exists
- a page draft is required for the MVP loop

Required input:
- Product Brief
- Page Strategy
- tone pack
- design rules
- proof inputs

Required output:
- page draft
- section structure
- render-ready package

Failure policy:
- if strategy or proof inputs are incomplete, block generation
- do not invent unsupported claims or sections

Handoff:
- QA and release preparation

### 4.7 `knowledge-curator`

Purpose:
- write release learnings, promoted rules, and memory state changes back into the Research DB

Trigger:
- release review complete
- blocked release requires learning capture
- freshness review finds contested or stale memory

Required input:
- release record
- learning note
- synthesis candidates
- freshness review context

Required output:
- memory write-back payload
- promoted rules
- conflict flags
- stale flags

Failure policy:
- if evidence is weak or conflicting, write provisional memory only
- do not promote active knowledge without support

Handoff:
- Research DB
- memory review

## 5. P1 Skills

| Skill | Purpose | Why It Is P1 |
|---|---|---|
| `brand-voice` | enforce brand tone and proof structure | depends on stable tone pack and stronger content rules |
| `feishu-ops` | package reports and dashboards | depends on stable reporting outputs |

## 6. Controller Topology

The MVP control plane should be:

- top-level routing: `fusera-os-orchestrator` skill
- specialist research controller: `research-orchestrator`
- bounded specialist agents: `review-miner`, `copy-strategist`, `performance-advisor`
- deferred execution controller: `execution-orchestrator`, only after downstream execution work exceeds the release-stage handoff already managed by the routing skill

## 7. P0 Agents

### 7.1 `research-orchestrator`

Purpose:
- coordinate market and competitor research

Trigger:
- new market
- launch request
- weekly scan

Input schema:
- market
- category
- target audience
- evidence scope

Output schema:
- evidence pack
- market scan
- open questions

Parallelism:
- yes, for bounded research tasks

Write-back:
- sources
- syntheses
- research report

### 7.2 `review-miner`

Purpose:
- collect and structure VOC evidence

Trigger:
- new product
- low conversion investigation
- repositioning

Input schema:
- review corpus
- VOC source list
- product context

Output schema:
- pain-point clusters
- objection matrix
- trust phrases

Parallelism:
- yes, across review and community sources

Write-back:
- VOC note
- language bank

### 7.3 `copy-strategist`

Purpose:
- convert strategy and evidence into narrative and CTA logic

Trigger:
- approved Page Strategy exists

Input schema:
- Product Brief
- Page Strategy
- tone pack
- proof inputs

Output schema:
- Copy Matrix
- CTA set
- section copy priorities

Parallelism:
- no, default serial

Write-back:
- copy decision note

### 7.4 `performance-advisor`

Purpose:
- interpret metrics and recommend fix order

Trigger:
- release review
- KPI drop
- experiment end

Input schema:
- release record
- metrics
- test notes

Output schema:
- diagnosis
- recommended fix order
- confidence score

Parallelism:
- limited; serial for final recommendation

Write-back:
- Learning Note
- metric delta summary

## 8. P1 Agents

| Agent | Purpose | Why It Is P1 |
|---|---|---|
| `page-publisher` | coordinate preview, publish, and release records | depends on a stable release package |
| `memory-librarian` | maintain research DB freshness and quality | depends on active research DB usage |
| `execution-orchestrator` | turn approved outputs into downstream actions | deferred until release-stage handoffs exceed the routing skill scope |

## 9. Controller and Specialist Pattern

The default orchestration pattern is:

1. routing skill or controller receives the task
2. routing skill or controller decomposes the task into bounded subproblems
3. specialist agents execute subproblems
4. routing skill or controller reconciles outputs
5. final result is written to durable artifacts

Allowed parallel categories:

- competitor research
- market scan
- review mining
- source extraction

Serial categories by default:

- strategy approval
- page generation
- QA
- release

## 10. Handoff Rules

Every handoff must include:

- source task id or context
- owner
- expected output
- confidence level when relevant
- write-back destination

No agent output should be considered complete unless it is either:

- embedded in a named artifact
- written into the research DB
- attached to a release or learning record

## 11. Failure and State Rules

Shared state vocabulary:

- `incomplete`
- `low-confidence`
- `provisional`
- `blocked`
- `approved`
- `released`
- `contested`
- `stale`

Shared write-back destinations:

- `research/sources/`
- `research/syntheses/`
- `research/briefs/`
- `research/releases/`
- `research/learnings/`

When an automation step fails:

- classify the failure as input, evidence, tool, strategy, generation, QA, or release failure
- record the failure reason
- route it to the owning human or previous stage
- avoid invisible manual recovery

Blocked publish is always preferred over weak publish.

## 12. Suggested Implementation Order

Build in this order:

1. `fusera-os-orchestrator`
2. `market-scout`
3. `voice-of-customer`
4. `landing-page-factory`
5. `knowledge-curator`
6. `content-studio`
7. `ops-analyst`
8. `research-orchestrator`
9. `copy-strategist`
10. `review-miner`
11. `performance-advisor`

This order mirrors the current P0 battlefronts:

- research
- strategy, page generation, content, and memory write-back
- release feedback

## 13. Related Documents

- [Fusera_Overseas_OS.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_Overseas_OS.md)
- [Fusera_OS_Operations_Manual.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Operations_Manual.md)
- [Fusera_OS_Research_DB_Spec.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Research_DB_Spec.md)
