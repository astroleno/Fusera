# Fusera V1 PRD And Technical Design

Date: 2026-04-20
Status: Draft for review
Scope: Product definition, roadmap, V1 PRD, technical stack, system design

## 1. Summary

Fusera V1 is an AI product for independent sellers, small teams, media buyers, and cross-border merchants.

Its first job is narrow and concrete:

- Take product images plus structured product information
- Generate a brand-forward, high-conversion, single-page landing page
- Make the output good enough to use for showcase, testing, and paid traffic

The wedge is not "website generation" in the abstract.
The wedge is "turn ordinary product inputs into a landing page that looks materially better than generic AI builders and generic template tools."

Externally, the product behaves like a vertical AI site-generation app.
Internally, it is built as a reusable agent-cli infra harness with controlled generation, prompt packs, skill packs, and a page compiler.

## 2. Product Thesis

General-purpose AI assistants will compress broad "build me a website" value over time.
Fusera should therefore win on workflow packaging, design quality, and delivery reliability rather than on raw model capability.

The product thesis is:

- Users do not want an agent; they want a result
- In this wedge, the result is a polished landing page, not a chat transcript
- Small sellers will tolerate lightweight structured input if it yields much better output
- Quality comes from a hybrid system, not from unconstrained prompting alone
- The moat is the combination of taste, conversion structure, controlled page assembly, and quality review loops

## 3. Target User

Primary user:

- Independent sellers and small teams with direct-response or product-marketing needs
- Cross-border merchants who need a fast, polished landing page without hiring design plus frontend talent
- Media buyers and operators who need a better page than no-code templates can usually deliver

Secondary user:

- Advanced users who want more control over layout direction, section order, brand tone, and generation constraints

Not the initial user:

- Agencies needing full CMS workflows
- Enterprise teams needing approvals, SSO, audit-heavy workflows, and multi-role governance
- Users who expect a full multi-page storefront in V1

## 4. Core User Problem

Current options are poor in different ways:

- Generic AI website tools often produce bland, repetitive, low-taste output
- Traditional no-code builders are flexible but require too much manual work
- Custom design plus frontend work is expensive and slow
- Existing AI tools rarely package product understanding, brand framing, conversion structure, and final polish into one flow

Users need:

- Faster time to first viable page
- Better design quality out of the box
- Enough structure to support conversion, not just visual novelty
- A flow that does not require them to understand prompting or agent systems

## 5. V1 Product Definition

### 5.1 One-Sentence Definition

Fusera V1 turns product images and structured product inputs into a brand-forward, high-conversion, single-page landing page.

### 5.2 V1 Output

The V1 output is a single-page landing page that blends:

- The conversion intent of a single-product page
- The visual and narrative strength of a brand homepage

This is not a full website builder in V1.

### 5.3 V1 Input Contract

Required inputs:

- 1 to 6 product images
- Product name
- Core selling points
- Target audience
- Brand keywords
- Primary CTA

Strongly recommended inputs:

- Price and discount information
- Trust signals
- Competitor or reference links
- Preferred tone
- Optional visual reference direction

Optional inputs:

- FAQ points
- Testimonials
- Shipping or guarantee details
- Brand story paragraph

### 5.4 User Modes

Novice mode:

- Guided intake
- More automatic inference
- Fewer control knobs
- Strong defaults

Pro mode:

- Editable structure
- Style locking or style steering
- Section enable/disable
- Tone control
- Skill pack or generation profile selection

## 6. Goals And Non-Goals

### 6.1 V1 Goals

- Produce a first draft landing page in minutes
- Achieve a visibly higher design bar than generic AI builders
- Make output stable enough that regeneration feels controlled, not random
- Allow lightweight editing after generation
- Support preview and publish on a shareable URL

### 6.2 V1 Non-Goals

- Full multi-page independent sites
- Blog, CMS, collections, cart, or checkout
- Full SEO program
- Full GEO program
- Full bot protection or enterprise security posture
- Arbitrary custom code execution for end users
- Completely zero-input "image only" generation

## 7. Success Metrics

Primary metrics:

- Time to first published draft
- Draft-to-publish rate
- Share/export rate
- Week-2 retained creators
- Paid conversion from trial to subscription

Quality metrics:

- Internal review score for design quality
- Internal review score for structure and copy clarity
- User regeneration rate due to dissatisfaction
- Manual rescue rate required by the team

Business metrics:

- Cost per successful published page
- Gross margin per active team
- Average pages generated per workspace

## 8. Product Requirements

### 8.1 Functional Requirements

1. Users can create a new project and upload product images.
2. Users can fill a structured intake form with required product and brand fields.
3. The system can analyze inputs and generate a product brief.
4. The system can generate a page strategy with narrative, section order, and content priorities.
5. The system can compile the strategy into a high-quality landing page draft.
6. Users can preview the generated page before publishing.
7. Users can make constrained edits without rebuilding everything from scratch.
8. Users can regenerate either the whole page or selected sections.
9. Users can publish a page to a shareable hosted URL.
10. Users can duplicate a project and generate variants.

### 8.2 Quality Requirements

- Output must feel intentionally designed, not obviously templated
- Mobile and desktop layouts must both be strong
- Typography, spacing, and hierarchy must remain coherent across variants
- CTA placement, proof structure, and section sequencing must support conversion logic
- Generation must be bounded enough that failures are diagnosable

### 8.3 Reliability Requirements

- Long-running generation jobs must be resumable or retryable
- Each generation run must preserve artifact history
- Users must see current run status and failure reasons
- Publish operations must be versioned

## 9. UX Overview

### 9.1 Novice Flow

1. Start project
2. Upload images
3. Fill guided form
4. Choose a high-level visual direction
5. Generate first draft
6. Review preview
7. Request targeted refinements
8. Publish

### 9.2 Pro Flow

1. Start project
2. Upload images and structured fields
3. Set generation profile
4. Lock style or structure constraints
5. Generate page
6. Edit sections, copy, and variant settings
7. Publish variant

### 9.3 Editing Philosophy

V1 editing should be constrained, not fully freeform.

Allowed editing in V1:

- Copy edits
- Section reorder
- Section on/off
- Theme intensity
- Tone adjustments
- CTA changes
- Partial regeneration

Deferred editing:

- Freeform layout editing
- Arbitrary DOM editing
- Full visual builder behavior

## 10. Roadmap

### 10.1 Near Term: 0 To 3 Months

Objective:
Ship the narrowest commercially testable version.

Includes:

- Guided intake
- Product brief generation
- Brand plus conversion page strategy
- Single-page draft generation
- Preview
- Partial regeneration
- Hosted shareable preview
- Basic publish flow
- Internal screenshot-based QA loop

Explicitly deferred:

- Custom domains
- Team collaboration
- Deep analytics
- Full SEO workbench
- Full anti-bot stack

### 10.2 Mid Term: 3 To 9 Months

Objective:
Turn the wedge into a more durable product.

Includes:

- Brand memory and saved profiles
- More page archetypes
- More section families
- Version history and variants
- Team workspaces
- Custom domains
- Basic SEO controls
- Template packs by vertical
- Better editing and regeneration controls
- Better observability and eval dashboards

### 10.3 Long Term: 9 To 18 Months

Objective:
Expand from landing-page generation into an AI growth surface for independent commerce.

Includes:

- Multi-page site generation
- Brand knowledge base
- Cross-page consistency engine
- SEO and GEO workflow layer
- Creative asset generation linkage
- Growth experiments and A/B generation
- Security and abuse hardening
- Verticalized packs for specific industries

## 11. Product Strategy Recommendation

The recommended rollout path is:

- Use the landing-page wedge to validate willingness to pay
- Build internal systems as reusable infra from day one
- Keep the external surface simple and task-based
- Add power-user controls only where they improve output quality or retention

This means the public story is:

- "Generate a high-quality landing page from your product materials"

Not:

- "Use our general AI agent framework"

## 12. System Design Principles

### 12.1 Principles

- Controlled generation beats unrestricted generation
- The canonical artifact is a structured page spec, not raw code
- Design quality requires both synthesis and review
- Prompt packs should be modular and replaceable
- Model provider choices should stay abstracted behind one orchestration layer
- User-facing simplicity should not block internal infra reuse

### 12.2 Canonical Generation Pipeline

The core pipeline is:

1. Input ingestion
2. Product and brand brief extraction
3. Page strategy planning
4. Section graph generation
5. Design token generation
6. Page compilation
7. Screenshot capture and quality review
8. Publishable artifact creation

### 12.3 Why A Hybrid Harness

Pure template systems will cap quality.
Pure open-ended generation will be unstable and expensive.

The recommended approach is a hybrid harness:

- Agent layer for understanding and decision-making
- Registry layer for approved sections and patterns
- Compiler layer for stable rendering
- Critic layer for screenshot and structure review

## 13. Proposed Architecture

### 13.1 Core Components

Frontend app:

- Project creation
- Intake flow
- Preview and review UI
- Editing controls
- Publish UI

Agent orchestration layer:

- Intake analyzer
- Product brief agent
- Page strategist
- Design director
- Copy synthesizer
- Critic or QA agent

Structured artifact layer:

- ProductBrief
- BrandProfile
- PagePlan
- SectionGraph
- ThemeTokens
- PublishVersion

Rendering layer:

- Section registry
- Theme engine
- Page compiler
- Renderer

Job layer:

- Long-running generation jobs
- Retry and resumability
- Screenshots and audits
- Publish jobs

### 13.2 Canonical Artifacts

ProductBrief:

- Product name
- Audience
- Pain points
- Value props
- Trust inputs
- CTA strategy

BrandProfile:

- Tone
- Keywords
- Visual direction
- Competition or positioning cues

PagePlan:

- Core narrative
- Conversion angle
- Section ordering
- Proof strategy
- CTA strategy

SectionGraph:

- Ordered sections
- Props per section
- Copy blocks
- Asset mapping

ThemeTokens:

- Color system
- Typography rules
- Spacing rhythm
- Radius, borders, shadows, motion settings

### 13.3 Section Registry

V1 should use a bounded section registry instead of arbitrary page code generation.

Initial sections may include:

- Hero
- Problem or desire framing
- Feature grid
- Benefit storytelling
- Before and after
- Social proof
- FAQ
- Offer block
- CTA footer

Each section should expose:

- Schema
- Variants
- Content slots
- Responsive behavior
- Theming hooks

## 14. Recommended Technical Stack

### 14.1 Application Layer

- Next.js App Router
- TypeScript
- Tailwind CSS plus a tightly controlled design-token layer
- React component registry for sections

Reason:

- Strong full-stack ergonomics
- Good fit for app plus preview plus publish flows
- Mature server and client split
- Straightforward hosting path for V1

### 14.2 AI Orchestration Layer

- AI SDK as the provider abstraction and structured generation interface
- Internal prompt packs and skill packs for:
  - intake analysis
  - page strategy
  - design direction
  - copy generation
  - screenshot critique

Reason:

- Keeps the system provider-agnostic
- Supports structured output and tool use cleanly
- Avoids coupling the product to one model vendor

### 14.3 Workflow Layer

- Trigger.dev for long-running jobs, retries, queues, and generation status

Reason:

- Generation, screenshot QA, and publish are async and stateful
- V1 benefits from built-in observability instead of ad hoc job code

### 14.4 Data Layer

- Supabase Postgres for app data
- Supabase Auth for user and workspace auth
- Supabase Storage for V1 asset handling

Reason:

- Fastest integrated path for auth plus DB plus storage
- Good enough for V1 while leaving migration room later

### 14.5 Media And Artifact Layer

- Start with Supabase Storage in V1
- Introduce Cloudflare R2 when artifact volume, public asset traffic, or cost profile justifies it

Reason:

- Avoid premature infrastructure splitting
- Preserve a clear path for scaling public artifacts later

### 14.6 Billing

- Stripe Checkout and subscriptions

### 14.7 Email

- Resend for transactional email

### 14.8 Security And Abuse

V1:

- Cloudflare Turnstile on high-risk entry points
- Basic rate limiting
- Signed publish actions

Later:

- Cloudflare WAF rules
- Abuse scoring
- Stronger publish and upload protection

## 15. Deployment Recommendation

Recommended V1 deployment:

- Main app on Vercel
- Background jobs on Trigger.dev Cloud
- Data and storage on Supabase
- CDN and protection via Cloudflare in front of public surfaces as needed

V1 publish model:

- Published pages live under Fusera-hosted URLs first
- Custom domains are a mid-term feature

This keeps the initial shipping path simple while preserving room for later domain and artifact separation.

## 16. Internal Skill And Harness Model

The infra harness should be treated as a product subsystem, not as an implementation detail.

Suggested internal packs:

- Intake skill pack
- Product analysis skill pack
- Conversion page strategy pack
- Design direction pack
- Premium style pack
- Screenshot critic pack
- Publish and validation pack

The design moat is likely to come from:

- Your existing workflow knowledge
- Taste-skill and design prompt adaptation
- Claude design style references
- Curated constraints
- A review loop that judges real rendered output, not only text specs

## 17. Risks And Mitigations

### 17.1 Risk: Output Still Feels Generic

Mitigation:

- Build section families with intentional variance
- Add screenshot-based review loops
- Use design-token generation plus style packs instead of plain copy-first generation

### 17.2 Risk: Uncontrolled Regeneration Quality

Mitigation:

- Make the page spec canonical
- Regenerate at section or token level where possible
- Keep deltas inspectable

### 17.3 Risk: V1 Scope Creep Into Full Website Builder

Mitigation:

- Keep V1 output to one page
- Push multi-page and SEO platform concerns into later phases

### 17.4 Risk: Cost Per Generated Page Is Too High

Mitigation:

- Use smaller models for extraction and structuring
- Reserve premium models for planning and critique passes
- Cache artifacts aggressively

### 17.5 Risk: Power Users Want Too Much Freedom Too Early

Mitigation:

- Offer bounded advanced controls
- Avoid arbitrary code editing in V1
- Expand control surfaces only after usage evidence

## 18. Assumptions

- V1 is English-first for output quality in cross-border selling use cases
- Input may be Chinese or English
- Users are willing to provide lightweight structured fields for better results
- Publish in V1 means hosted shareable page, not a full independent commerce stack
- The team wants to treat infra reuse as a long-term asset

## 19. Decisions Locked In

- Start with a vertical product wedge, not a general AI assistant
- The wedge is image-plus-structured-data to landing page
- V1 output is a single-page landing page
- The page should blend product conversion and brand presentation
- The system should use a hybrid harness, not pure templates and not pure freeform generation
- Small-business ROI users are the initial market, not the broadest consumer audience

## 20. Open Questions

These are not blockers for V1 specification, but they affect later planning:

- Which initial visual generation profiles should be first-class in V1
- Whether published pages should support lightweight analytics in V1 or only in mid-term
- Whether initial value packaging is credit-based, subscription-based, or hybrid
- How much post-generation editing should happen in the app versus by regeneration prompts

## 21. Recommendation

Proceed with Fusera as a vertical AI product for generating brand-forward, high-conversion landing pages from product images and structured product inputs.

Build the external product as a simple result-oriented app.
Build the internal system as a reusable agent-cli infra harness with structured artifacts, prompt packs, skill packs, and a page compiler.

This gives the project a credible commercial wedge now and a real infrastructure platform later.

## 22. Next Step After Approval

If this document is approved, the next step is to create an implementation phase plan for V1.

That plan should break the work into:

- Product intake and project model
- Generation pipeline and canonical artifacts
- Section registry and page compiler
- Preview, editing, and regeneration
- Publish flow, hosting model, and basic platform services
- Eval, observability, and quality gates
