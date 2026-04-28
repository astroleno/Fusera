# Fusera OS Operations Manual

Status: Draft v1  
Last Updated: 2026-04-22  
Document Type: Operations Manual

## 1. Purpose

This manual turns the Fusera OS master guide into an executable team workflow.

It is designed to answer:

- what the team should do in v0 and MVP
- in what order work should happen
- who owns each stage
- when work can move forward
- what happens when a stage fails
- what must be written back after each cycle

## 2. v0 and MVP Scope

### 2.1 What v0 Must Deliver

Fusera v0 exists to prove one thing:

Fusera can take a minimum product input package and produce one English-first, high-quality, release-ready landing page through a controlled workflow.

### 2.2 In Scope

- English-first landing page generation
- single-product and campaign-oriented landing pages
- Product Brief creation
- Page Strategy creation
- page draft generation
- quality-gated release packaging
- preview and standard deployment flow
- post-release learning write-back

### 2.3 Out of Scope

- multi-page site generation
- direct ad account execution
- full website theming
- non-English-first market support beyond exploratory preparation
- fully autonomous publishing without human release approval

## 3. Minimum Executable Loop

The mandatory v0 and MVP loop is:

`input package -> brief -> strategy -> page draft -> QA -> release package -> publish -> learning note`

### 3.1 Required Inputs

The minimum input package must contain:

- product images
- product name
- top selling points
- target audience
- brand keywords
- CTA

The workflow should not proceed past intake unless these are present.

### 3.2 Required Evidence

At least one evidence source must be attached before strategy is approved:

- review summary
- competitor landing page
- public market signal
- merchant-provided proof or claim source

### 3.3 Required Outputs

Every completed run must produce:

- `Product Brief`
- `Page Strategy`
- generated page draft
- `QA Scorecard`
- `Release Package`
- `Learning Note`

### 3.4 Definition of Done

A run is complete only when:

- the page is publish-ready
- gate thresholds are met
- the release package is stored
- the release or blocked-release decision is recorded
- the learning note is written back

## 4. Stage-by-Stage Runbook

### 4.1 Intake

Owner:
- Conversion Strategy Lead

Required inputs:
- minimum input package

Outputs:
- normalized intake package
- missing-input list if incomplete

Exit criteria:
- all required inputs are present
- no critical ambiguity about product, audience, or CTA

Failure path:
- block downstream work
- request missing inputs
- record intake gaps

Write-back:
- intake gaps log
- normalized intake package

### 4.2 Research

Owner:
- Overseas Research Lead
- Research Agent

Inputs:
- intake package
- target market
- known competitor or channel context

Outputs:
- evidence pack
- signal notes
- source records

Exit criteria:
- evidence pack attached
- confidence level recorded
- weak evidence explicitly flagged

Failure path:
- reroute for more evidence
- mark low-confidence state
- do not allow unsupported claims into strategy

Write-back:
- source pages
- evidence notes
- synthesis candidates

### 4.3 Strategy

Owner:
- Conversion Strategy Lead
- Strategy Agent

Inputs:
- intake package
- evidence pack
- brand constraints

Outputs:
- Product Brief
- Page Strategy
- section priority
- CTA direction

Exit criteria:
- one dominant audience
- one dominant promise
- one primary CTA
- clear section order

Failure path:
- return to research when evidence is weak
- return to intake when core inputs conflict

Write-back:
- strategy decision log
- approved Product Brief
- approved Page Strategy

### 4.4 Generation

Owner:
- Engineering Lead
- Design Agent
- Copy Strategist

Inputs:
- Product Brief
- Page Strategy
- tone pack
- design rules

Outputs:
- page draft
- Copy Matrix
- section structure
- supporting assets

Exit criteria:
- draft renders correctly
- copy aligns to strategy
- layout respects design system

Failure path:
- return to strategy if narrative breaks
- return to design rules if style drifts
- return to intake if critical facts are missing

Write-back:
- generation run record
- draft package

### 4.5 Review and QA

Owner:
- QA and Release Lead
- QA Agent

Inputs:
- draft package
- gate checklist

Outputs:
- QA Scorecard
- issue list
- release recommendation

Exit criteria:
- thresholds met
- blockers resolved
- compliance risk equals zero

Failure path:
- block release
- route back to generation, strategy, or intake based on failure type

Write-back:
- QA Scorecard
- blocker log
- review notes

### 4.6 Release

Owner:
- QA and Release Lead
- Release Agent

Inputs:
- approved draft package
- QA pass

Outputs:
- Release Package
- preview or publish record

Exit criteria:
- release package stored
- deployment action recorded
- version traceable

Failure path:
- rollback to last approved version
- pause publish
- create release incident note

Write-back:
- release record
- rollback record if triggered

### 4.7 Learn

Owner:
- Data Lead
- Memory Librarian

Inputs:
- release record
- metrics
- QA notes
- operator notes

Outputs:
- Learning Note
- next-action candidates

Exit criteria:
- one learning note written
- next action classified as keep, change, test, or retire

Failure path:
- if metrics are unavailable, create provisional learning note and revisit within 7 days

Write-back:
- Learning Note
- metric delta summary
- rule update candidate

## 5. Weekly Rhythm

### Monday: Research Scan

Goal:
- decide what changed in the market
- decide what needs research this week

Outputs:
- signal triage list
- research tasks

### Tuesday: Strategy Review

Goal:
- convert research into page angles and CTA choices

Outputs:
- approved strategy list
- blocked items with reasons

### Wednesday: Design Review

Goal:
- make sure output still respects the design system and target market aesthetic

Outputs:
- design decisions
- token or layout adjustments

### Thursday: QA and Release Gate

Goal:
- approve or block candidate releases

Outputs:
- QA decisions
- release approvals
- rollback recommendations

### Friday: Learning Review

Goal:
- summarize results and feed lessons into memory

Outputs:
- weekly learnings
- changes to templates, tone, or gates

## 6. Monthly Rhythm

### Start of Month

- choose target market
- choose target category
- choose experiment theme

### Mid-Month

- review new and stale knowledge
- resolve contested claims
- inspect recurring failures

### End of Month

- update thresholds
- retire weak templates
- upgrade design and tone rules
- publish one operating update

## 7. Release Gate Checklist

### Pre-generation

- product information complete
- target audience clear
- promise singular
- market and language matched
- no obvious compliance blocker

### Post-generation

- design system respected
- value visible in first screen
- CTA clear and dominant
- mobile layout usable
- no terminology drift
- no exaggerated claims

### Pre-release

- no blocking console errors
- no broken links
- no missing assets
- no empty CTA
- critical claims traceable
- screenshot review passed

## 8. Escalation Rules

| Problem | Escalate To | Default Action |
|---|---|---|
| Missing critical facts | Intake owner | block generation |
| Weak or conflicting evidence | Research owner | return to research |
| Unclear promise or CTA | Strategy owner | block release path |
| Design drift | Design system owner | return to generation |
| Tone or localization mismatch | Content/localization owner | rewrite before release |
| Score below threshold | QA owner | block release automatically |
| Compliance risk > 0 | Human approver | no publish action allowed |

## 9. Current P0 Battlefronts

Only these three battlefronts should receive top-level execution priority:

1. `research -> brief -> release` loop
2. Research DB and memory
3. Design system and tone pack

Every new task should be tested against these questions:

- Does it make the closed loop stronger?
- Does it make memory more reusable?
- Does it reduce brand drift?

If not, it should not be P0.

## 10. Immediate Team Actions

The first execution sequence for the team should be:

1. approve one canonical input template
2. approve one Product Brief template
3. approve one Page Strategy template
4. approve one QA Scorecard
5. run one complete page through the loop
6. write one Learning Note
7. update one rule based on the result

## 11. Related Documents

- [Fusera_Overseas_OS.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_Overseas_OS.md)
- [Fusera_OS_Skills_Agents_Spec.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Skills_Agents_Spec.md)
- [Fusera_OS_Research_DB_Spec.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Research_DB_Spec.md)
