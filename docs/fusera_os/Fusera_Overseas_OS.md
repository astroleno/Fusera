# Fusera Overseas OS

Status: Draft v1  
Last Updated: 2026-04-22  
Document Type: Operating System / Master Guide  
Owner: Fusera OS Owner

## 1. Purpose

This document defines the operating system for Fusera.

Fusera is not only an AI page generator. It should become a compact overseas growth OS for independent sellers, small teams, media buyers, and cross-border merchants who need to turn product information into high-conversion, brand-forward landing pages that can be published, measured, and continuously improved.

This OS aligns product, research, content, design, engineering, operations, QA, and automation around one shared goal:

Build and ship high-quality overseas landing pages faster, with stronger brand consistency, better evidence, and tighter conversion feedback loops.

This document is the master guide for the documents in this folder:

- [README.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/README.md)
- [Fusera_OS_Operations_Manual.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Operations_Manual.md)
- [Fusera_OS_Skills_Agents_Spec.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Skills_Agents_Spec.md)
- [Fusera_OS_Research_DB_Spec.md](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_os/Fusera_OS_Research_DB_Spec.md)

This document also serves as the master guide above these existing companion product documents:

- [Fusera_Product_Requirements_Document.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Product_Requirements_Document.txt)
- [Fusera_System_Design_Overview.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_System_Design_Overview.txt)
- [Fusera_Development_Plan.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Development_Plan.txt)
- [Fusera_Quality_Control_Guidelines.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Quality_Control_Guidelines.txt)
- [Fusera_Deployment_Notes.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Deployment_Notes.txt)

## 2. Vision

### 2.1 One-line Vision

Fusera helps overseas sellers and growth teams turn fragmented product inputs into trustworthy, high-conversion, publish-ready landing pages.

### 2.2 Long-term Mission

Fusera should reduce the cost of going from product idea to market-facing page, while increasing:

- conversion quality
- brand consistency
- research depth
- publishing speed
- learning reuse

### 2.3 Why Fusera Needs an OS

If Fusera is only a generator, it will produce pages.

If Fusera is an OS, it can coordinate:

- market signals
- product and audience insight
- page strategy
- copy and design generation
- publishing and deployment
- measurement and learning
- reusable knowledge and automation

### 2.4 Strategic Horizon

Over the next 12-24 months, Fusera should evolve from:

1. single-page AI generation
2. to evidence-backed page strategy
3. to multi-market page operations
4. to semi-autonomous overseas landing page production

### 2.5 Non-goals

Fusera should not try to become all of the following at once:

- a general website builder for every use case
- a generic AI copywriting chatbot
- a full ERP or ad-buying platform
- a purely template-driven no-code page library

Its focus is high-conversion overseas landing pages with strong brand and operating logic.

## 3. Positioning

### 3.1 Category Definition

Fusera is an AI-powered overseas landing page operating system.

### 3.2 Core Promise

Give Fusera product facts, audience context, and brand direction.
Receive a page strategy, high-quality copy, visual structure, QA checks, and a publish-ready page.

### 3.3 What Makes Fusera Different

Fusera should differentiate on four dimensions:

- evidence-backed generation, not blind generation
- brand-forward pages, not generic templates
- operating workflow, not one-off outputs
- reusable memory, not repeated manual rediscovery

### 3.4 Competitive Frame

Fusera sits between:

- AI copy tools
- lightweight page builders
- design systems
- research workflows
- publishing automation

Its advantage is orchestration.

### 3.5 Default Operating Scope for v0 and MVP

To avoid becoming a generic overseas growth platform too early, Fusera should operate within the following default scope first:

- Primary language: English-first output
- Primary markets: US-first, with UK/CA/AU as adjacent English-speaking expansion markets
- Primary page types:
  - single-product landing pages
  - campaign-specific product pages
  - offer pages with strong CTA
  - lead-capture pages for validation campaigns
- Explicitly out of scope for v0:
  - full multi-page website generation
  - full store theming
  - marketplace listing management
  - direct ad account execution
- Priority evidence sources:
  - merchant-provided product inputs
  - reviews and VOC
  - competitor landing pages
  - campaign copy and public market signals
  - first-party page analytics after release
- Default publishing path:
  - preview link first
  - one-click deployment second
  - external CMS or WordPress publishing as a later-stage extension
- Hard evidence rule:
  - any factual claim on the page must come from source inputs, approved brand claims, or traceable research
  - unverified generated claims are not allowed into release-ready output

## 4. Target Users

### 4.1 Primary Users

- Independent sellers
- Small cross-border teams
- Media buyers
- DTC and marketplace operators
- Merchants needing fast campaign or product landing pages

### 4.2 Role Types

| Role Type | Main Need | Main Friction |
|---|---|---|
| Decision maker | Launch faster with confidence | No unified strategy and no clear quality standard |
| Executor | Produce pages quickly | Inputs are incomplete and feedback is scattered |
| Operator | Improve conversion | Hard to connect research, copy, page, and performance |
| Brand owner | Keep consistency | Output quality drifts across campaigns and markets |

### 4.3 Typical Jobs To Be Done

- Turn a product brief into a launch-ready page
- Adapt a product story for a new market
- Generate multiple angle-based pages for testing
- Convert research and reviews into conversion copy
- Publish and measure pages without rebuilding the workflow each time

## 5. North Star and Success Model

### 5.1 North Star

Early stage north star:

`Weekly number of high-quality pages published that pass release gates`

Growth stage north star:

`Effective conversions generated by high-quality Fusera pages`

### 5.2 Supporting Success Chain

The success chain for Fusera is:

`complete input -> strong strategy -> strong page output -> successful release -> measurable conversion -> learning reuse`

### 5.3 Stage Targets

| Stage | Primary Goal |
|---|---|
| MVP | Stable single-page generation and review flow |
| V1 | Better research input and stronger QA gates |
| V2 | Multi-market, multi-version, reusable operating memory |

### 5.4 Minimum Executable Loop for v0 and MVP

The minimum executable loop for Fusera is:

`input package -> brief -> strategy -> page draft -> QA -> release package -> publish -> learning note`

This loop is the only required production loop for v0 and MVP.

| Item | v0 Requirement |
|---|---|
| Minimum input | product images, product name, selling points, target audience, brand keywords, CTA |
| Required evidence | at least one of: review summary, competitor page, public market signal, or merchant-supplied proof |
| Mandatory stages | brief, strategy, generation, QA, release, write-back |
| Minimum output | Product Brief, Page Strategy, generated page draft, QA Scorecard, Release Package, Learning Note |
| Definition of done | page is publish-ready, passes gates, and is stored with release record |
| Failure policy | no gate pass means no release; fallback is return-to-brief or return-to-strategy, not manual silent publish |
| Write-back policy | every release and every blocked release must generate a learning record |

### 5.5 Current Three Battlefronts

For the next 90 days, Fusera should treat only these three battlefronts as top-level priorities:

| Battlefront | Why It Matters | Allowed Scope |
|---|---|---|
| `research -> brief -> release` closed loop | proves Fusera can reliably ship one strong page end to end | one-page generation only |
| Research DB and memory | prevents repeated rediscovery and gives future runs better context | core sources, entities, syntheses, and release learnings |
| Design system and tone pack | prevents brand drift and AI slop before scale | minimum token set, layout grammar, CTA grammar, tone guide |

Any work outside these battlefronts must justify why it directly improves one of them.

## 6. OS Principles

Fusera should run on these principles:

1. Humans own goals and judgment.
2. Agents own collection, structuring, and repeatable execution.
3. Evidence should precede conclusions.
4. Brand consistency is a hard requirement, not a polish step.
5. Quality gates must block bad output before release.
6. Every run should leave behind reusable memory.
7. Workflows should be layered so the system scales without chaos.

## 7. Capability Architecture

Fusera should be organized into five operating layers.

| Layer | Purpose | Inputs | Outputs |
|---|---|---|---|
| Signal Layer | Collect market, audience, product, and performance signals | keywords, reviews, competitor pages, trends, analytics | raw evidence and structured findings |
| Insight Layer | Turn evidence into decisions | signal data, market context, product facts | briefs, hypotheses, page strategy |
| Creation Layer | Generate conversion assets | strategy, brand rules, design rules | copy, page sections, layout directions, assets |
| Execution Layer | Publish and operationalize outputs | approved page package | previews, releases, dashboards, tasks |
| Memory Layer | Preserve reusable learning | reports, outcomes, conflicts, improvements | knowledge base, templates, rules, playbooks |

### 7.1 Layer Inspirations

This architecture is informed by patterns found in:

- [Amazon-ABAkeyword](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/Amazon-ABAkeyword/README.md>)
- [amazon-product-search](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/amazon-product-search/README.md>)
- [BSC-Amazon-Rufus-Cosmo](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-Amazon-Rufus-Cosmo/README.md>)
- [BSC-amazon-VOC-trending-products](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-amazon-VOC-trending-products/README.md>)
- [lingxing-mcp](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/lingxing-mcp/README.md>)
- [llm-wiki](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/llm-wiki/README.md>)
- [awesome-design-md](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/awesome-design-md/README.md>)
- [novamira](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/novamira/README.md>)

## 8. Core Functional Modules

### 8.1 Acquisition and Market Research

Purpose:
Identify markets, angles, keywords, products, and signals worth acting on.

Recommended pattern sources:

- [Amazon-ABAkeyword](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/Amazon-ABAkeyword/README.md>)
- [amazon-product-search](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/amazon-product-search/README.md>)
- [tavily-ai-skills](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/tavily-ai-skills/README.md>)
- [reddit-mcp-buddy](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/reddit-mcp-buddy/README.md>)

Outputs:

- market opportunity scan
- keyword priority list
- competitor watchlist
- channel-specific insight notes

### 8.2 User Insight and Voice of Customer

Purpose:
Convert reviews, complaints, and audience language into usable positioning and copy inputs.

Recommended pattern sources:

- [amazon-reviews](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/amazon-reviews/README.md>)
- [BSC-Amazon-Rufus-Cosmo](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-Amazon-Rufus-Cosmo/README.md>)
- [BSC-amazon-VOC-trending-products](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-amazon-VOC-trending-products/README.md>)

Outputs:

- pain-point map
- objection list
- language bank
- trust and proof inventory

### 8.3 Brand and Website System

Purpose:
Ensure every generated page feels intentional, consistent, and category-appropriate.

Recommended pattern sources:

- [awesome-design-md](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/awesome-design-md/README.md>)
- [novamira](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/novamira/README.md>)

Outputs:

- brand voice system
- design token set
- page composition rules
- publishing surface rules

### 8.4 Landing Page Generation

Purpose:
Turn product and audience evidence into sections, copy, layout logic, and publishable pages.

Recommended pattern sources:

- [BSC-Amazon-Rufus-Cosmo](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-Amazon-Rufus-Cosmo/README.md>)
- [Fusera_Product_Requirements_Document.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Product_Requirements_Document.txt)

Outputs:

- Product Brief
- Page Strategy
- Section Graph
- Copy Matrix
- generated page draft

### 8.5 Content Production

Purpose:
Convert insight into reusable assets beyond the page itself.

Recommended pattern sources:

- [BSC-amazon-advertising-strategy](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-amazon-advertising-strategy/README.md>)
- [tavily-ai-skills](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/tavily-ai-skills/README.md>)
- [BSC-Amazon-Rufus-Cosmo](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-Amazon-Rufus-Cosmo/README.md>)

Outputs:

- ad angles
- FAQ packs
- comparison copy
- blog or help content
- campaign variants

### 8.6 Operating Analysis and Feedback

Purpose:
Measure what worked, what failed, and what should change next.

Recommended pattern sources:

- [Amazon-Operations-Analysis-Dashboard](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/Amazon-Operations-Analysis-Dashboard/README.md>)
- [BSC-amazon-VOC-trending-products](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-amazon-VOC-trending-products/README.md>)
- [lingxing-mcp](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/lingxing-mcp/README.md>)

Outputs:

- page performance review
- issue diagnosis
- budget and focus recommendations
- release and iteration recommendations

### 8.7 Knowledge and Memory

Purpose:
Make every cycle compound rather than reset.

Recommended pattern sources:

- [llm-wiki](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/llm-wiki/README.md>)
- [claude-code-best-practice](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/claude-code-best-practice/README.md>)
- [skill-summarize](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/skill-summarize/README.md>)

Outputs:

- reusable prompts
- skills
- agent playbooks
- decision log
- reusable market memory

### 8.8 Automation and Distribution

Purpose:
Push approved work into dashboards, tasks, publishing endpoints, and operating rituals.

Recommended pattern sources:

- [BSC-Amazon-sif-keyword-lark-builder](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-Amazon-sif-keyword-lark-builder/README.md>)
- [Amazon-ABAkeyword](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/Amazon-ABAkeyword/README.md>)
- [amazon-product-search](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/amazon-product-search/README.md>)
- [novamira](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/novamira/README.md>)

Outputs:

- reports
- dashboards
- task payloads
- publishing actions
- release records

## 9. End-to-End Workflow

Fusera should operate through this standard flow:

1. Signal intake
2. Product and audience brief creation
3. Insight synthesis
4. Page strategy generation
5. Copy and visual generation
6. Preview and micro-adjustments
7. Quality gate review
8. Release
9. Measurement
10. Learning write-back

### 9.1 Workflow Stages

| Stage | Goal | Primary Output |
|---|---|---|
| Intake | Gather complete, structured inputs | intake package |
| Research | Collect evidence and market context | evidence notes |
| Strategy | Decide page angle and information hierarchy | Page Strategy |
| Generation | Produce page and supporting assets | draft page package |
| Review | Validate quality and market fit | QA Scorecard |
| Release | Publish and document deployment | Release Package |
| Learn | Capture performance and reusable lessons | Learning Note |

### 9.2 Stage Contract

Each workflow stage must have an owner, exit rule, failure path, and write-back rule.

| Stage | Owner | Exit Criteria | Failure Path | Memory Write-back |
|---|---|---|---|---|
| Intake | Conversion Strategy Lead | all required inputs present and normalized | request missing inputs, block downstream generation | intake gaps log |
| Research | Overseas Research Lead / Research Agent | evidence pack attached to brief | mark low-confidence state and reroute for more evidence | evidence notes and source records |
| Strategy | Conversion Strategy Lead / Strategy Agent | one dominant promise, audience, CTA, and section direction | return to research if evidence weak; return to intake if inputs conflict | strategy decision log |
| Generation | Engineering Lead / Design Agent / Copy Strategist | page draft, copy, and layout package rendered successfully | return to strategy when narrative breaks; return to design rules when style drifts | generation run record |
| Review | QA and Release Lead / QA Agent | all gate thresholds met and blockers cleared | block release and route back to generation or strategy | QA Scorecard and issue list |
| Release | QA and Release Lead / Release Agent | release package stored and preview/publish action completed | rollback to last approved version or pause release | release record |
| Learn | Data Lead / Memory Librarian | learning note written and linked to release | flag missing data and revisit after 7-day window | learning note, metric delta, rule update candidate |

## 10. Team Topology and Roles

### 10.1 Human Roles

| Role | Responsibility | Key Output |
|---|---|---|
| Fusera OS Owner | Prioritization, trade-offs, final decisions | roadmap, standards |
| Overseas Research Lead | Market questions, competitor and channel research | opportunity map |
| Conversion Strategy Lead | Offer framing, CTA strategy, information hierarchy | Page Strategy |
| Design System Lead | Visual rules, layout quality, component boundaries | design system |
| Content and Localization Lead | Copy quality, tone, cultural fit | Copy Matrix, locale guide |
| Engineering Lead | Generation pipeline, release pipeline, integrations | product systems |
| QA and Release Lead | Gates, regression checks, approval, rollback | QA report, release checklist |
| Data Lead | Metric definitions, dashboards, experiment analysis | metric dashboard |

### 10.2 Agent Roles

| Agent | Responsibility | Output |
|---|---|---|
| Research Agent | Gather evidence and summarize signal changes | source pages, evidence notes |
| Strategy Agent | Convert evidence into page and offer recommendations | strategy options |
| Design Agent | Generate and validate visual directions | layout proposal, screenshots |
| QA Agent | Run checks and surface quality gaps | scorecard, issue list |
| Release Agent | Package approved outputs and record release state | release package |

## 11. Standard Inputs and Outputs

### 11.1 Standard Inputs

- Product images
- product name
- selling points
- target audience
- brand keywords
- CTA
- price, specs, FAQ, and claims
- competitor pages and campaign assets
- review and community signals
- analytics and feedback
- brand rules and compliance constraints

### 11.2 Standard Outputs

- `Product Brief`
- `Page Strategy`
- `Section Graph`
- `Copy Matrix`
- `Design Tokens`
- `QA Scorecard`
- `Release Package`
- `Learning Note`

## 12. Research and Knowledge System

### 12.1 Research DB Structure

Fusera should maintain a research database using a wiki-like structure:

```text
research/
  sources/
  entities/
  concepts/
  syntheses/
  reports/
  briefs/
```

### 12.2 Knowledge Record Fields

Each reusable knowledge entry should contain:

- `claim`
- `evidence`
- `source_id`
- `confidence`
- `freshness`
- `owner`
- `last_reviewed_at`
- `status`

Suggested statuses:

- `active`
- `contested`
- `stale`
- `retired`

### 12.3 Research Rules

Research should follow this order:

1. collect sources
2. extract evidence
3. form claims
4. record conflicts
5. write to memory
6. allow strategy consumption

### 12.4 Freshness and Ownership Rules

- Every active synthesis must have an owner.
- Every high-impact market or audience note must be reviewed at least monthly.
- Any `contested` or `stale` knowledge cannot become default context until reviewed.
- Release learnings must be written back within one working day of release review.
- The `memory-librarian` agent can suggest cleanup, but the owning human decides retire vs retain.

### 12.5 Research Inspirations

Useful supporting references:

- [llm-wiki/wiki/competitive-analysis-workflow.md](/Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/llm-wiki/wiki/competitive-analysis-workflow.md)
- [llm-wiki/wiki/two-layer-automation.md](/Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/llm-wiki/wiki/two-layer-automation.md)
- [claude-code-best-practice/best-practice/claude-skills.md](/Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/claude-code-best-practice/best-practice/claude-skills.md)
- [claude-code-best-practice/best-practice/claude-subagents.md](/Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/claude-code-best-practice/best-practice/claude-subagents.md)

## 13. Brand System

### 13.1 Brand Requirements

Fusera-generated pages must maintain:

- a consistent voice
- a coherent promise
- visual intentionality
- market-appropriate phrasing
- believable proof structures

### 13.2 Brand System Components

- tone-of-voice guide
- value proposition patterns
- CTA grammar
- trust block rules
- visual token system
- responsive layout rules
- market-specific localization guidance

### 13.3 Design System Direction

Fusera should use design-system-like documents as operating constraints, not optional inspiration.

Relevant reference:

- [awesome-design-md](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/awesome-design-md/README.md>)

## 14. MCP and Multi-Agent Operating Model

### 14.1 MCP as Tool Bus

In Fusera, MCP should act as the tool bus for:

- competitor collection
- research extraction
- analytics lookup
- screenshot sampling
- publishing actions
- QA checks
- release packaging

### 14.2 Agent Model

Fusera should use a controller-plus-specialist pattern:

- the controller agent decomposes work
- specialist agents handle bounded tasks
- all results return to a durable record
- no decision should exist only in chat history

### 14.3 Handoff and Parallelism Rules

- Only the controller agent may fan out concurrent research tasks.
- Specialist agents must receive bounded scopes, explicit expected outputs, and a write-back destination.
- No specialist agent may publish directly without a release-stage handoff.
- Research and VOC tasks may run in parallel.
- Strategy, generation, QA, and release should remain serial by default.
- Any tool failure must return a structured failure reason, not silent fallback behavior.

## 15. Quality Gates

Fusera should use three release layers.

### 15.1 Pre-generation Gate

- product information complete
- target audience clear
- core promise singular
- market and language matched
- no obvious compliance blocker

### 15.2 Post-generation Gate

- design system respected
- value clear in the first screen
- CTA clear and dominant
- mobile-first layout usable
- no terminology drift or exaggerated claims

### 15.3 Pre-release Gate

- no blocking console errors
- no broken links
- no missing assets
- no empty CTA
- evidence-backed critical claims
- screenshot review passed

### 15.4 Hard Thresholds

- technical release score >= 90
- design and layout score >= 85
- copy and localization score >= 85
- compliance risk = 0

### 15.5 Escalation Rules

- Missing critical product facts: escalate to intake owner
- Weak or conflicting evidence: escalate to research owner
- Unclear promise or CTA: escalate to strategy owner
- Design drift or layout inconsistency: escalate to design system owner
- Localization or tone mismatch: escalate to content and localization owner
- Gate score below threshold: block release automatically
- Compliance risk above zero: require explicit human resolution before any publish action

## 16. Operating Rhythm

### 16.1 Weekly Cadence

- Monday: research scan and signal triage
- Tuesday: strategy review
- Wednesday: design review
- Thursday: QA and release gate review
- Friday: results and learning review

### 16.2 Monthly Cadence

- start of month: choose target market, category, and experiment theme
- mid-month: review new, stale, and conflicting knowledge
- end of month: update gates, retire weak templates, upgrade design rules
- monthly: publish a Fusera market and operating update

## 17. Metrics System

### 17.1 North Star Metrics

- early stage: high-quality pages shipped per week
- growth stage: effective conversions generated by those pages

### 17.2 Process Metrics

- time from input to first draft
- time from first draft to release-ready
- number of revision cycles
- first-pass gate success rate
- template reuse rate
- agent task completion rate
- rework rate

### 17.3 Outcome Metrics

- page conversion rate
- CTA click-through rate
- hero engagement time
- bounce rate
- visit-to-publish conversion
- post-release rewrite rate within 7 days

### 17.4 Health Metrics

- source coverage rate
- low-confidence claim ratio
- unresolved conflict age
- stale knowledge ratio
- release failure rate
- page generation cost

## 18. Internal Skills and Agents To Build

Fusera should gradually formalize its own internal skill library.

### 18.1 Priority Skills

| Skill | Purpose | Trigger | Priority |
|---|---|---|---|
| `fusera-os-orchestrator` | detect stage, route work, and enforce handoffs | ambiguous multi-stage requests, new runs, blocked workflow recovery | P0 |
| `market-scout` | collect market, category, and keyword opportunities | new market, new angle, weekly scan | P0 |
| `voice-of-customer` | mine reviews, complaints, and audience language | new product, repositioning, copy rewrite | P0 |
| `landing-page-factory` | produce structured page outputs from briefs | page generation request | P0 |
| `knowledge-curator` | write decisions and learnings back to memory | after releases and reviews | P0 |
| `content-studio` | generate campaign and support content from strategy | launch, paid campaigns, content expansion | P0 |
| `ops-analyst` | diagnose page or campaign performance | low conversion, bad bounce, unclear issue | P0 |
| `brand-voice` | enforce brand tone and proof structure | every copy-critical run | P1 |
| `feishu-ops` | package outputs into reports and dashboards | weekly and monthly reporting | P1 |

### 18.2 Priority Agents

For MVP, the top-level control plane should be a routing skill, not two competing controller agents.

Operating rule:

- `fusera-os-orchestrator` should become the top-level routing skill
- `research-orchestrator` remains the specialist research controller under that routing layer
- `execution-orchestrator` stays deferred until downstream execution work exceeds the release-stage handoff handled by the routing skill

| Agent | Purpose | Priority |
|---|---|---|
| `research-orchestrator` | coordinate market and competitor research | P0 |
| `review-miner` | collect and structure VOC evidence | P0 |
| `copy-strategist` | turn evidence into narrative and CTA logic | P0 |
| `performance-advisor` | explain what to change next | P0 |
| `page-publisher` | coordinate preview, publish, and release records | P1 |
| `memory-librarian` | maintain research DB freshness and quality | P1 |
| `execution-orchestrator` | turn approved outputs into downstream actions | P1 |

### 18.3 P0 Skill Contracts

| Skill | Required Input | Required Output | Failure Policy | Handoff |
|---|---|---|---|---|
| `fusera-os-orchestrator` | user task or run context, current stage artifacts, known workflow status | routing decision, next-stage instruction, handoff package, escalation note when needed | if stage context is unclear, stop and request the missing artifact or status rather than performing deep domain work | to the correct P0 child skill or the owning human gate |
| `market-scout` | target market, category, product keyword, channel constraints | market scan, keyword list, competitor watchlist, confidence note | if source coverage is weak, mark scan incomplete and request more sources | to `research-orchestrator` or Product Brief |
| `voice-of-customer` | ASIN, review set, category reviews, or community feedback | pain-point map, objections, proof phrases, language bank | if reviews are sparse, mark evidence weak and do not claim broad market truth | to `copy-strategist` and Product Brief |
| `landing-page-factory` | Product Brief, Page Strategy, tone pack, design rules, proof inputs | page draft, section structure, render-ready package | if strategy or proof inputs are incomplete, block generation rather than improvising unsupported sections | to QA and release preparation |
| `knowledge-curator` | release record, learning note, synthesis candidates, freshness review context | memory write-back payload, promoted rules, conflict flags, stale flags | if evidence is weak or conflicting, write provisional memory only and do not promote to active knowledge | to Research DB and memory review |
| `content-studio` | Page Strategy, brand tone, content objective | copy variants, FAQ pack, campaign assets, reuse-ready snippets | if strategy missing, block generation instead of improvising | to generation package or campaign workflow |
| `ops-analyst` | release record, page metrics, experiment data | diagnosis, issue ranking, next-action plan | if data freshness is low, produce provisional diagnosis only | to weekly review and Learning Note |

### 18.4 P0 Agent Contracts

| Agent | Trigger | Input Schema | Output Schema | Parallelism | Write-back |
|---|---|---|---|---|---|
| `research-orchestrator` | new market, launch, weekly scan | market, category, target audience, evidence scope | evidence pack, market scan, open questions | yes, for bounded research tasks | sources, syntheses, research report |
| `review-miner` | new product, low conversion, repositioning | review corpus, VOC source list, product context | pain-point clusters, objection matrix, trust phrases | yes, across sources | VOC note, language bank |
| `copy-strategist` | approved Page Strategy exists | Product Brief, strategy, tone pack, proof inputs | Copy Matrix, CTA set, section copy priorities | no, default serial | copy decision note |
| `performance-advisor` | release review, KPI drop, experiment end | release record, metrics, test notes | diagnosis, recommended fix order, confidence score | limited; serial for final recommendation | learning note, metric delta summary |

## 19. Implementation Roadmap

### Phase 0: Governance Foundation (1-2 weeks)

- define role ownership
- define gate criteria and naming rules
- create research DB structure
- define metric glossary
- create minimum design system
- define tool integration inventory

### Phase 1: Single-page Closed Loop (2-6 weeks)

- intake -> brief -> strategy -> design -> preview -> QA -> publish
- first gate scorecard
- first release checklist
- mandatory learning note after release

### Phase 2: Research-driven Optimization (6-12 weeks)

- competitor library
- market library
- audience library
- claim/evidence/conflict model
- template segmentation by market and category
- link page strategy to performance

### Phase 3: Multi-market Expansion (3-6 months)

- multi-language support
- multi-market variants
- brand-style variations
- A/B experiments
- market playbooks

### Phase 4: Semi-autonomous Operation (6+ months)

- stable multi-agent production line
- default-context memory system
- lower cost to launch in new markets
- team focus shifts from making pages to compounding conversion quality

### 19.1 MVP Scope Lock

The MVP should be treated as complete only when all of the following are true:

- one English-first landing page can be produced end to end
- the page is based on a structured Product Brief and Page Strategy
- the page passes QA thresholds before release
- the release package is stored with traceable inputs
- one Learning Note is generated after release review

The MVP is not complete when:

- the page looks good but has no evidence record
- the release happened without a scorecard
- the workflow depended on hidden manual fixes
- knowledge was learned but not written back

### 19.2 Deferred Until After MVP

The following items should be explicitly deferred until the MVP loop is stable:

- multi-language generation beyond English-first
- full multi-page site generation
- direct ad execution
- advanced publishing surfaces beyond preview and default deployment
- heavy parallel agent chains for non-critical work

## 20. Risks and Boundaries

Major risks:

- research distortion
- hallucinated copy
- design drift
- localization mismatch
- compliance issues
- uncontrolled tool sprawl
- vanity metric bias
- unstable releases
- memory bloat
- decision bottlenecks

Controls:

- evidence-first research
- hard QA gates
- explicit ownership
- conflict logging
- staged rollout
- regular knowledge pruning

## 21. Immediate Next Moves

The recommended next actions for Fusera are:

1. Approve this OS as the master guide.
2. Define the minimum research DB structure.
3. Define the minimum design system and tone-of-voice pack.
4. Implement the closed loop from brief to release.
5. Build the routing skill shell plus the six P0 child skills:
   - `fusera-os-orchestrator`
   - `market-scout`
   - `voice-of-customer`
   - `landing-page-factory`
   - `knowledge-curator`
   - `content-studio`
   - `ops-analyst`
6. Add the first specialist controller agents:
   - `research-orchestrator`
7. Start weekly and monthly operating rituals immediately, even before full automation.

## 22. Reference Inputs

Primary Fusera inputs:

- [Fusera_Product_Requirements_Document.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Product_Requirements_Document.txt)
- [Fusera_System_Design_Overview.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_System_Design_Overview.txt)
- [Fusera_Development_Plan.txt](/Users/aitoshuu/Documents/GitHub/Fusera/docs/fusera_project_docs/Fusera_Development_Plan.txt)

Primary external inspirations from `reference/luotwo`:

- [Amazon-ABAkeyword](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/Amazon-ABAkeyword/README.md>)
- [amazon-product-search](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/amazon-product-search/README.md>)
- [amazon-reviews](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/amazon-reviews/README.md>)
- [BSC-Amazon-Rufus-Cosmo](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-Amazon-Rufus-Cosmo/README.md>)
- [BSC-amazon-VOC-trending-products](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-amazon-VOC-trending-products/README.md>)
- [BSC-amazon-advertising-strategy](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/BSC-amazon-advertising-strategy/README.md>)
- [Amazon-Operations-Analysis-Dashboard](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/Amazon-Operations-Analysis-Dashboard/README.md>)
- [lingxing-mcp](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/lingxing-mcp/README.md>)
- [reddit-mcp-buddy](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/reddit-mcp-buddy/README.md>)
- [tavily-ai-skills](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/tavily-ai-skills/README.md>)
- [llm-wiki](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/llm-wiki/README.md>)
- [awesome-design-md](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/awesome-design-md/README.md>)
- [novamira](</Users/aitoshuu/Documents/GitHub/Fusera/reference/luotwo/novamira/README.md>)
