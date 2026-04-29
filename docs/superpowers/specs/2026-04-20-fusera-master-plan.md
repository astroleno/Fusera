# Fusera Master Plan

Date: 2026-04-20
Status: Active program plan, app Phase 1 in progress
Purpose: Hardened program plan built from the V1 PRD, technical design, and supplemental project docs

## Current Implementation Checkpoint

Updated: 2026-04-29

Current app branch: `codex/app-baseline`

Implemented:

- Harness P1 path is closed through live/model-owned artifacts, deterministic `PageSpec` compilation, deterministic QA, and preview `PublishVersion`.
- App Phase 1 Task 1 is complete: Next.js App Router shell, global styles, Vitest, Playwright, and production build baseline.
- App Phase 1 Task 2 is complete: project intake schema, canonical app-side artifact envelope and payload schemas, Supabase persistence skeleton, and initial migration.
- App Phase 1 Task 3 is complete: `/projects/new` guided intake page and `POST /api/projects` invalid-input path.
- App Phase 1 Task 4 is complete: deterministic placeholder generation for `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens`; generation trigger task; and `POST /api/projects/[projectId]/generate`.

Not yet implemented:

- App-side section registry and preview compiler.
- Project preview route backed by persisted artifacts.
- Micro-adjustments and partial regeneration.
- Quality scoring and publish flow.
- Full intake-to-preview E2E path.

Current continuation plan:

- `docs/superpowers/plans/2026-04-29-fusera-phase-1-continuation-plan.md`

## 1. Executive Summary

Fusera should launch as a vertical AI product, not a general-purpose agent shell.

The commercial wedge is:

- Input: product images plus structured product information
- Output: a brand-forward, high-conversion single-page landing page
- User promise: one-click generation, lightweight micro-adjustments, and one-click deployment

The long-term architecture should still be built as a reusable agent-cli infra harness.
This lets the external product stay simple while the internal system compounds across future products, styles, and verticals.

## 2. Inputs Used For This Plan

This master plan consolidates:

- The V1 PRD and technical design spec in `docs/superpowers/specs/2026-04-20-fusera-image-to-brand-landing-design.md`
- Supplemental notes in `docs/fusera_project_docs/`

Key additions from the supplemental docs that are now elevated into the program plan:

- Explicit one-click deployment as part of the V1 user story
- Lightweight post-generation micro-adjustments in the MVP
- A formal automated quality scoring loop
- A simpler Phase 1 / 2 / 3 framing that maps well to delivery milestones

## 3. Product Positioning

### 3.1 What Fusera Is

Fusera is an AI landing-page generation product for ROI-driven sellers and operators.

It is designed to help users go from product materials to a polished, deployable page faster than:

- generic AI website generators
- manual no-code page assembly
- custom design plus frontend workflows

### 3.2 What Fusera Is Not

Fusera is not initially:

- a full multi-page independent site builder
- a headless CMS platform
- a complete SEO and GEO operating system
- a broad AI assistant for arbitrary tasks

### 3.3 Core Differentiation

Fusera should differentiate on four fronts:

- Better design taste
- Better conversion-oriented page structure
- Better output stability through controlled generation
- Faster end-to-end delivery from input to deployment

## 4. Product Architecture Strategy

Fusera should be built as a layered system.

### 4.1 User-Facing Layer

User-facing workflow:

1. Upload product images
2. Fill structured product fields
3. Select a high-level visual or tone direction
4. Generate the page
5. Preview and make micro-adjustments
6. Deploy with one click

### 4.2 Internal Capability Layer

Internal reusable capability stack:

- Intake normalization
- Product brief synthesis
- Page strategy planning
- Section graph generation
- Theme token generation
- Page compilation
- Screenshot-based quality review
- Versioned deployment pipeline

### 4.3 Why This Matters

This split allows:

- a simple product surface for novice users
- bounded controls for power users
- reuse of skills, prompts, evaluators, and deployment flows in later products

## 5. Delivery Model

The delivery model should be:

- public surface: vertical product
- internal system: reusable harness

This means:

- Messaging stays narrow and outcome-based
- The roadmap expands by adjacent features and adjacent verticals
- Infrastructure decisions are made with reuse in mind, but product scope stays tight

## 6. Program Goals

### 6.1 Near-Term Goal

Prove that users will pay for a high-quality landing-page generator that materially outperforms generic AI builders.

### 6.2 Mid-Term Goal

Turn the wedge into a durable product with profiles, variants, better editing, and basic growth surfaces.

### 6.3 Long-Term Goal

Evolve into an AI growth platform for independent commerce while preserving the original quality bar.

## 7. Program Constraints

The plan should assume:

- the harness is already implemented under `superpowers/`
- the app has completed Phase 1 Tasks 1-4 on `codex/app-baseline`
- limited initial engineering bandwidth
- quality is more important than breadth
- design reputation is a core part of the moat
- deployment and publish speed matter for user perception

## 8. Program Tracks

The work should run across six tracks.

### 8.1 Track A: Product And UX

Scope:

- onboarding
- guided input
- visual direction selection
- preview
- micro-adjustments
- deploy flow

Success condition:

- users can get from project start to deployment without needing prompt engineering knowledge

### 8.2 Track B: Generation And Page Assembly

Scope:

- canonical artifacts
- brief generation
- strategy generation
- section graph generation
- theme tokens
- page compiler

Success condition:

- the system generates pages via structured artifacts instead of brittle raw code dumping

### 8.3 Track C: Quality Control

Scope:

- automated structure checks
- screenshot-based AI review loops
- quality scoring
- release gates for publishable output

Success condition:

- generation quality can be measured, compared, and improved over time

### 8.4 Track D: Deployment And Delivery

Scope:

- hosted preview URLs
- one-click deployment
- publish versioning
- rollback-safe publish model

Success condition:

- users perceive the output as real and immediately usable, not just a draft artifact

### 8.5 Track E: Platform Foundations

Scope:

- auth
- projects
- workspaces
- assets
- generation runs
- artifact persistence

Success condition:

- the app has a clean backbone for future expansion without overbuilding V1

### 8.6 Track F: Commercial Readiness

Scope:

- pricing hooks
- usage accounting
- conversion instrumentation
- internal metrics

Success condition:

- the team can measure product value and cost, not just usage volume

## 9. Phase Roadmap

### 9.1 Phase 1: Core MVP, 0 To 3 Months

Theme:
Generate, refine, preview, deploy.

Deliverables:

- guided intake for product images plus structured fields
- page generation pipeline
- bounded section registry
- high-quality single-page output
- preview and micro-adjustments
- hosted preview URL
- one-click deployment to Fusera-hosted page
- automated quality scoring baseline

Exit criteria:

- a new user can produce and deploy a first page in one session
- output is visibly stronger than generic AI builders in internal review
- the publish path is stable enough for real testing use cases

### 9.2 Phase 2: Product Hardening, 3 To 6 Months

Theme:
More control, better memory, more repeatability.

Deliverables:

- saved brand profiles
- expanded section library
- more micro-adjustment controls
- version and variant management
- better quality dashboards
- custom domains
- stronger feedback capture

Exit criteria:

- repeat users can create consistent pages faster than in Phase 1
- teams can manage multiple outputs without losing quality or traceability

### 9.3 Phase 3: Growth Expansion, 6 To 12 Months

Theme:
From page generation to growth surface.

Deliverables:

- multi-language support
- advanced content generation
- A/B testing hooks
- cross-page consistency groundwork
- collaboration features
- verticalized packs

Exit criteria:

- Fusera is no longer only a generator; it supports iteration and learning loops

## 10. Decision Log

The following decisions are now treated as locked unless the product strategy changes:

- The first product is landing-page generation, not full-site generation
- The initial page type blends a single-product page and a brand homepage
- Inputs are product images plus structured fields, not image-only magic
- The system uses a hybrid harness with structured artifacts and a compiler
- Quality review is part of the core system, not an optional future nicety
- One-click deployment is part of the V1 story
- Micro-adjustments are part of the V1 story, but full freeform visual editing is not

## 11. Quality Plan

### 11.1 Quality Dimensions

Every generated page should be scored across:

- design quality
- layout and typography coherence
- conversion structure quality
- copy clarity
- mobile usability
- deployment readiness

### 11.2 Quality Mechanisms

The quality system should include:

- schema validation for structured artifacts
- renderer validation for the compiled page
- screenshot-based AI critique
- a numeric or banded quality score
- optional publish thresholding in later phases

### 11.3 Why Quality Must Be A First-Class Track

The product promise is not generic output.
If quality is not systematized early, Fusera risks becoming another wrapper around commodity generation.

## 12. Deployment Strategy

### 12.1 V1 Deployment

V1 should support:

- hosted preview URLs
- hosted production URLs under a Fusera-controlled domain
- one-click publish from an approved draft

### 12.2 Deferred Deployment Features

Defer to Phase 2 or later:

- custom domains
- deep SEO controls
- full security and bot hardening
- advanced environment management

## 13. Technology Direction

The current preferred direction remains:

- Next.js App Router for the application surface
- React with controlled design tokens for rendering; the current app baseline uses global CSS, with Tailwind still optional for later UI system work
- Supabase for data, auth, and early storage
- AI SDK for model abstraction and structured generation
- Trigger.dev for asynchronous generation and QA workflows
- Stripe for billing
- Resend for transactional email
- Cloudflare services as deployment and protection needs expand

## 14. Risks

### 14.1 Risk: Master Plan Expands Too Fast

Mitigation:

- treat Phase 1 exit criteria as a hard scope wall
- do not absorb multi-page, CMS, or broad SEO asks into the MVP

### 14.2 Risk: Quality Expectations Outpace System Stability

Mitigation:

- use a bounded section registry
- treat the structured page spec as canonical
- invest early in quality scoring and screenshot review

### 14.3 Risk: Deployment Becomes An Afterthought

Mitigation:

- keep publish and deployment in the Phase 1 scope
- evaluate every draft as a candidate deployable output, not only as a design exercise

## 15. What This Means For Planning

The implementation plan should now focus only on Phase 1.

That plan should not attempt to cover:

- custom domains
- multi-language support
- multi-page generation
- advanced collaboration
- full SEO tooling

Instead it should focus on:

- product intake and project model
- generation pipeline and canonical artifacts
- section registry and compiler
- preview, micro-adjustments, and regeneration
- publish and one-click deployment
- automated quality scoring baseline

## 16. Recommendation

Adopt this master plan as the program-level source of truth for roadmap and sequencing.

Use the existing V1 PRD and technical design spec as the detailed product and architecture reference.
Use the next implementation plan as the executable Phase 1 delivery document.
