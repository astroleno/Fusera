# Fusera OS Research DB Spec

Status: Draft v1  
Last Updated: 2026-04-22  
Document Type: Research and Memory Specification

## 1. Purpose

This document defines how Fusera should store, review, and reuse research and operating memory.

The research DB is not a document dump.
It is the memory layer of Fusera OS.

Its job is to:

- preserve evidence
- separate claims from sources
- track confidence and freshness
- retain release learnings
- prevent repeated rediscovery

## 2. Core Principles

1. Sources come before claims.
2. Evidence comes before strategy.
3. Conflicts must be recorded, not hidden.
4. Memory must stay reviewable, not only searchable.
5. Release learnings are first-class knowledge objects.

## 3. Minimum Folder Structure

The recommended structure is:

```text
research/
  sources/
  entities/
  concepts/
  syntheses/
  reports/
  briefs/
  releases/
  learnings/
```

### 3.1 Folder Meanings

| Folder | Purpose |
|---|---|
| `sources/` | immutable or near-immutable raw references |
| `entities/` | brands, competitors, audiences, markets, products |
| `concepts/` | reusable conclusions or frameworks |
| `syntheses/` | combined conclusions for a market, category, or audience |
| `reports/` | weekly, monthly, QA, and experiment summaries |
| `briefs/` | Product Brief and Page Strategy artifacts |
| `releases/` | release records and version references |
| `learnings/` | post-release learnings and rule updates |

## 4. Canonical Record Fields

Every reusable knowledge object should carry these fields:

- `title`
- `claim`
- `evidence`
- `source_id`
- `confidence`
- `freshness`
- `owner`
- `last_reviewed_at`
- `status`

### 4.1 Allowed Status Values

- `active`
- `contested`
- `stale`
- `retired`

### 4.2 Confidence Guidance

| Confidence | Meaning |
|---|---|
| `high` | supported by multiple strong sources or repeated release evidence |
| `medium` | supported by at least one good source and partial corroboration |
| `low` | early observation, sparse evidence, or narrow sample |

## 5. Record Types

### 5.1 Source Record

Purpose:
- preserve raw reference and extraction context

Suggested fields:

```yaml
title:
source_id:
source_type:
url:
captured_at:
market:
category:
owner:
notes:
```

### 5.2 Entity Record

Purpose:
- define a reusable object such as a competitor, audience segment, or product type

Suggested fields:

```yaml
title:
entity_type:
market:
aliases:
owner:
status:
last_reviewed_at:
```

### 5.3 Concept Record

Purpose:
- capture transferable patterns

Example:
- North American DTC pages rely more on a strong first-screen promise plus visible proof

Suggested fields:

```yaml
title:
claim:
evidence:
source_ids:
confidence:
owner:
status:
```

### 5.4 Synthesis Record

Purpose:
- combine multiple sources and concepts into a usable recommendation for a market, audience, or page angle

Suggested fields:

```yaml
title:
market:
audience:
category:
core_claims:
supporting_evidence:
conflicts:
recommended_actions:
owner:
status:
```

### 5.5 Release Record

Purpose:
- preserve what was actually shipped

Suggested fields:

```yaml
release_id:
page_type:
market:
audience:
brief_ref:
strategy_ref:
qa_score:
released_at:
owner:
status:
```

### 5.6 Learning Record

Purpose:
- capture what changed after release and whether a rule should be updated

Suggested fields:

```yaml
learning_id:
release_id:
observed_result:
metric_delta:
what_worked:
what_failed:
recommended_change:
owner:
created_at:
status:
```

## 6. Research Workflow

The required workflow is:

1. collect source
2. extract evidence
3. write claim
4. check for conflict
5. assign confidence
6. write synthesis
7. allow strategy to consume it

The required release workflow is:

1. generate release record
2. wait for outcome data
3. write learning record
4. propose memory updates
5. review before promoting to active knowledge

## 7. Freshness Rules

- high-impact market or audience syntheses must be reviewed monthly
- launch-specific claims should be reviewed after each release cycle
- any `stale` note cannot become default context until reviewed
- any `contested` claim must be resolved or explicitly carried as contested

## 8. Ownership Rules

- every active synthesis must have an owner
- every release must have a release owner
- every learning note must have a data or strategy owner
- the `memory-librarian` agent may suggest cleanup, but humans approve retirements

## 9. Conflict Handling

When a new claim conflicts with existing memory:

1. do not overwrite silently
2. mark the old or new record as `contested`
3. attach the conflicting source ids
4. request owner review
5. only promote to `active` after review

## 10. What Must Be Written Back

The following artifacts are mandatory write-back items:

- blocked-release learnings
- successful release learnings
- recurring QA failures
- proven winning CTA patterns
- proven losing patterns
- localization failures
- changes to tone or design rules

If a run teaches Fusera something reusable, it belongs in memory.

## 11. Minimum Research DB for MVP

The MVP does not need a huge research library.

It only needs:

- `sources/`
- `syntheses/`
- `briefs/`
- `releases/`
- `learnings/`

That is enough to support the minimum executable loop.

## 12. Recommended Naming Rules

- source file names should be stable and traceable
- release ids should map to a page version or publish event
- learning ids should link back to one release id
- syntheses should be named by market, audience, and topic when possible

Examples:

- `source-us-competitor-landing-page-2026-04-22.md`
- `synthesis-us-pet-owner-hero-structure.md`
- `release-landingpage-2026-04-22-v1.md`
- `learning-release-2026-04-22-v1.md`

## 13. Suggested Review Cadence

| Artifact Type | Review Cadence |
|---|---|
| Sources | as needed |
| Syntheses | monthly |
| Briefs | per release |
| Releases | immediately after publish |
| Learnings | within one working day of review |

## 14. Related Documents

- [Fusera_Overseas_OS.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_Overseas_OS.md)
- [Fusera_OS_Operations_Manual.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Operations_Manual.md)
- [Fusera_OS_Skills_Agents_Spec.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Skills_Agents_Spec.md)
