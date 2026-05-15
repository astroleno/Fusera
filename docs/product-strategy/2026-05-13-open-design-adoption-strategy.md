# Fusera 与 Open Design 借鉴策略

Date: 2026-05-13
Status: Product and architecture strategy draft

## 1. Decision Summary

Fusera 不应该迁移成 Open Design 式的通用 AI 设计平台。

Fusera 应该保持垂直定位：面向外贸、电商、独立站和个人产品 MVP 阶段的 AI 商业设计流水线。Open Design 值得借鉴的是它的 design-system、harness、agent loop、artifact preview、anti-slop verifier 和工作台交互，不是它的完整 local-first daemon 产品形态。

Current go status: Conditional Go.

The first implementation slice is strictly:

```text
P0 landing-page proof loop only
```

Do not start Phase 2 image/poster modes, a public output picker, full canvas, comments, or partial regeneration until the landing-page proof loop reaches the commercial go/no-go thresholds in this document.

推荐方向：

```text
客户看到：
guided intake -> 商业视觉输出 -> 预览/对比/评论 -> 局部调整 -> 发布/导出

系统内部：
Codex-first harness agent
-> validated artifacts
-> deterministic compiler
-> QA/verifier gates
-> publish/export package
```

换句话说，Codex 是 P0 后台执行引擎，不是普通客户的主要交互界面。Claude Code 在当前阶段只能作为 future / instruction-only compatibility 目标，直到 adapter contract 真正毕业。客户需要的是可理解、可控制、可复用的商业设计工作台。

## 2. Product Positioning

主要客群：

- 外贸商家：需要商品主图、卖点图、详情页视觉、独立站首屏。
- 跨境电商团队：需要快速产出投放素材、平台图、活动图、A/B 版本。
- 独立站经营者：需要可发布的 landing page、产品页、活动页。
- 个人产品 MVP 团队：需要快速验证产品定位、卖点和转化页面。

4-6 周 lead ICP:

> 跨境商家 / 投放操盘手，用现有产品图、卖点和受众信息，生成可投放的产品 landing page，并导出可交给投手、设计师或独立站运营继续使用的版本。

这个 lead ICP 先不优化：

- 通用 SaaS MVP 用户。
- 纯品牌设计师。
- 需要 PPT、newsletter、复杂多页官网的团队。
- 没有产品图或商品卖点的空白创意需求。

产品核心问题不是“能不能生成任何设计”，而是：

> 客户给 Fusera 产品图片、卖点、受众和渠道后，系统能否稳定产出能卖货、可投放、可发布、可迭代的商业视觉资产？

因此，Fusera 的边界应从“landing page only”扩展为“commercial conversion outputs”，但不要扩成 Open Design 那样的通用设计平台。

## 2.1 Commercial Success Criteria

商业定位必须有可证伪验收标准。仅证明 tokens 变化、linter 有 findings、quality report 能展示，不足以证明客户愿意使用。

建议维护 5-10 个固定真实商家 brief，全部服务于 lead ICP。类目可以覆盖护肤、3C、B2B 工具、家居、服装配饰、食品/保健品，但场景必须统一：用产品图和卖点生成可投放 landing page。每个 brief 必须指定目标渠道、目标市场/语言、主要 CTA 和可用 proof。

P0/P1 验收指标：

| Metric | Target | Why |
|---|---:|---|
| First-draft usable rate | >= 60% | 首版无需大改即可进入人工微调或客户预览。 |
| Platform spec pass rate | >= 90% | 尺寸、安全区、文本密度、导出格式满足目标渠道。 |
| Export package acceptance | >= 80% | 产物能被内部 reviewer 判定为可交付或可投放候选。 |
| Claim compliance pass rate | 100% for P0 rules | 不允许虚构销量、认证、评论、折扣、奖项。 |
| Manual adjustment count | <= 3 meaningful edits | 证明不是“生成后主要靠人工修”。 |
| Draft-to-export/publish rate | >= 40% on seeded briefs before Phase 2 build | 用真实使用数据判断是否进入下个 output mode。 |

Go/no-go rule:

- If landing-page draft-to-export/publish is below 40% on the seeded brief set, do not start implementation of image/poster output modes.
- If seeded review finds any known invented metric, certification, award, discount, review count, or customer logo, the run cannot be marked export-ready. Full claim hard-gating waits for `ClaimRef` / `ProofRef`.
- If manual adjustment count stays above 3 meaningful edits, invest in intake, directions, and QA before adding output modes.

These metrics should become part of weekly product review before expanding output modes.

## 3. What To Adopt From Open Design

### 3.1 Adopt: Visual Direction Picker

Open Design 的方向选择器值得立即吸收，但方向分类要按 Fusera 客群重写。

不建议直接使用抽象的 `Editorial Monocle / Modern Minimal / Warm Soft / Tech Utility / Brutalist Experimental`。这些更适合设计师和通用原型工具。

Fusera 推荐首批方向：

| id | Name | Best For |
|---|---|---|
| `premium-editorial` | 高端独立站 | 护肤、美妆、家居、服饰、品牌型产品 |
| `marketplace-clean` | 平台电商清晰主图 | Amazon、Shopify listing、外贸 B2B 商品 |
| `performance-ad` | 高转化营销图 | 投放素材、活动图、利益点海报 |
| `social-commerce` | 社媒种草图 | 小红书、Instagram、TikTok、生活方式产品 |

Implementation fit:

- App intake 层增加 visual direction 选择。
- Domain schema 增加 `visualDirectionId`。
- Harness 将 direction 编译进 `BrandProfile`、`DesignSpec` 或 `ThemeTokens` 上游上下文。
- Direction 必须影响 tokens、layout rhythm、copy density、proof style 和 image treatment，而不是只换颜色。

### 3.1.1 Taxonomy Precedence

Visual direction、design system、output mode 不能互相抢 token authority。

| Layer | Customer Sees | System Role | Authority |
|---|---|---|---|
| Output mode | Landing page / main image / poster / ad creative | Determines artifact spine, compiler, QA rules, export package | Highest for structure and required fields |
| Channel / platform | Shopify / Amazon / Instagram / Xiaohongshu / Web | Determines size, safe area, text density, compliance checks | Highest for render/export constraints |
| Design system | Beauty / industrial / SaaS / fashion | Provides token vocabulary and component rhythm | Highest for token values |
| Visual direction | Premium / clean / performance / tech / social | Biases layout, copy density, image treatment, motion intensity | Advisory unless no design system is selected |
| Brand inputs | Keywords, reference URLs, product assets | Grounds positioning and proof | Wins over generic style defaults |

P0 rule: `visualDirectionId` is an input field and prompt/context selector, not a new stable artifact. If a future `VisualDirection` artifact is needed, it must be introduced with its own producer stage and schema instead of being casually inserted into the landing-page spine.

### 3.2 Adopt: Anti-Slop Linter

Fusera 已经有 `superpowers/packs/modifiers/anti-slop/SKILL.md`，但它目前更像 prompt guardrail，不是自动化 verifier。

应该落地成可执行 linter/verifier，分两层：

```text
design lint:
ThemeTokens / DesignSpec / PageSpec 层面的结构检查

render lint:
compiled preview / HTML / screenshot 层面的视觉和转化检查
```

Fusera 需要的 P0 商业规则：

- 不允许虚构认证、销量、评论、客户 logo、折扣、奖项。
- 不允许默认紫蓝渐变、泛 AI hero、emoji feature icons。
- 文本和背景对比度必须通过基本可读性检查。
- Landing page 必须有明确首屏 CTA。
- 营销图必须至少包含核心利益点、产品主体或使用场景之一。
- 主图类输出必须让产品成为第一视觉主体。
- 平台图和广告图必须避免过多小字。

Target state: anti-slop findings should become part of canonical `QAReport`, not only an advisory note.

Phasing:

- P0 app path: advisory linter feeding current quality score and UI warnings.
- P1 harness-integrated path: blocking `QAReport` gate for P0 rules, persisted with verifier evidence.
- P2 render path: screenshot/render evidence for visual hierarchy, text density, and product prominence.

### 3.3 Adopt: Design System Extraction, But Curate For Commerce

Open Design 的 design-system catalog 很有价值，但不应该全量搬进 Fusera 的客户选择器。Open Design 自身文档中不同位置对 design-system 数量也存在口径差异，所以这里不依赖精确数量。

Open Design 的 `DESIGN.md` design systems should be treated as prompt/design inspiration resources, not as Fusera artifact-contract sources. Fusera artifact contracts must remain defined under `superpowers/contracts/artifacts/` and app-side schemas.

Fusera 应先建立少量 landing-page 商业设计系统，而不是品牌仿风格库。P0 只需要 3-4 个能覆盖 lead ICP 的 direction/token presets；8-12 个系统属于后续扩展。

Recommended initial systems:

| System | Use Case |
|---|---|
| `premium-beauty` | 美妆、护肤、香氛 |
| `clean-consumer-electronics` | 3C、智能硬件 |
| `industrial-b2b` | 工具、机械、外贸 B2B |
| `home-lifestyle` | 家居、收纳、生活方式 |
| `fitness-performance` | 运动、健康、户外 |
| `fashion-editorial` | 服装、配饰、鞋包 |
| `food-natural` | 食品、保健品、天然产品 |

Each system should include:

- `DESIGN.md` prose guidance.
- Structured tokens compatible with Fusera `ThemeTokens`.
- Example section/image composition rules.
- Commercial constraints: proof, claims, image hierarchy, CTA style.

### 3.4 Adopt: Preview-First Workbench Patterns

Open Design 最近的网页设计更新中，最适合 Fusera 的不是视觉皮肤，而是工作台交互。

Useful patterns:

- Preview card with real generated cover.
- Output status tags: draft, validating, failed, approved, published.
- Version cards and multi-select.
- In-context preview comments.
- Right-side review panel.
- Viewport switcher.
- Section-level regeneration affordances.

Fusera should re-express these inside its own UI language, not copy Open Design's global CSS.

Before UI implementation, define the state and target-ref contract:

```text
generation_status: queued -> running -> completed | failed
review_state: none -> validating -> qa_failed | review_ready -> approved
export_state: none -> export_ready -> exported | published
repair_state: none -> repairing -> validating
```

Action enablement:

- Regenerate requires a stable target ref.
- Approve requires no blocking QA findings.
- Export/publish requires an approved version and target channel.
- Comments attach to stable refs, not DOM-only positions.

Stable refs needed by future `PageSpec` / `CommercialImageSpec` should use one `TargetRef` shape, not ad hoc strings:

```json
{
  "target_ref": "section:hero:v1",
  "kind": "section | claim | proof | asset | render-anchor | version",
  "artifact_ref": "page-spec_xxx",
  "path": "/payload/sections/0",
  "source_ref": "section-graph_xxx:hero",
  "version": 1,
  "status": "active | superseded | invalid",
  "remap": null
}
```

Rules:

- Target refs are version-bound. A regeneration that changes structure creates new refs.
- A superseded ref may include `remap` only when the system can prove a one-to-one successor.
- In the P0 landing-page proof loop, `TargetRef` is a schema/contract skeleton only.
- Comments, full canvas, and partial regeneration remain parked until `TargetRef` is persisted and consumed.
- UI scopes such as `"hero"` or `"theme"` may remain as legacy shortcuts in P0, but should not be expanded into new features.

### 3.5 Adopt: Harness Discipline

Open Design 的 agent loop 和 Fusera 的 harness 可以互相印证：

- Agent can reason and compose.
- Code owns schema, compiler, validation, publish gates.
- Artifacts are the contract.
- Rejected artifacts must remain inspectable.
- Preview/publish should be evidence-backed, not model-trust-based.

This aligns with Fusera's current P0 harness direction and should be strengthened.

## 4. What Not To Adopt

Do not adopt these as near-term goals:

- Do not clone Open Design's multi-app local daemon/web/desktop topology.
- Do not expose local daemon setup to normal customers.
- Do not make customers manage agent CLIs.
- Do not make the product a generic file/artifact tree.
- Do not make arbitrary HTML/TSX the primary customer-facing output contract.
- Do not prioritize 16 CLI adapters before the Codex runtime path is reliable.
- Do not expand to PPT/newsletters/general design before commercial outputs are reliable.

Fusera should remain a SaaS/workbench product with agent-native internals.

## 5. Recommended Architecture Direction

Current Fusera can stay monolithic for now, but the internal boundary should become clearer:

```text
Next.js App
  - customer intake
  - project workspace
  - preview/review UI
  - publish/export UI

Project Data Store
  - inputs
  - artifacts
  - runs
  - versions
  - comments

Harness Runner
  - stage profiles
  - pack resolution
  - Codex adapter
  - validation
  - repair/retry

Compilers
  - landing page compiler
  - image/poster compiler
  - future output compilers

Verifiers
  - schema validation
  - anti-slop lint
  - screenshot/render QA
  - publish/export gates
```

The key is not service count. The key is whether the product has durable seams between app UI, artifacts, runner, compiler, and verifiers.

## 5.1 App ↔ Harness Integration Boundary

Current customer-side generation path does not yet run the full canonical harness spine. The app path creates app-side artifacts through `buildPageArtifacts()` and persists refs through Supabase. The harness path defines the fuller P0 spine:

```text
ProductBrief
BrandProfile
PagePlan
SectionGraph
ThemeTokens
DesignSpec
PageSpec
QAReport
PublishVersion
```

This gap should be explicit until resolved.

Two acceptable integration options:

### Option A: App Calls Harness Runner

`/generate` enqueues a job that invokes `superpowers/runner` for the selected output mode. Supabase stores canonical artifacts and run summaries produced by the runner.

Pros:

- One artifact spine.
- Runner repair/retry/evidence semantics apply to customer generation.
- Less drift between app preview and harness verification.

Cons:

- Harder deployment/runtime story.
- Needs a clean runner API boundary and workspace isolation.

### Option B: App Mirrors Canonical Spine

The app-side generator continues to run inside the product app, but it must produce and persist the full canonical spine for the active mode, including `DesignSpec`, `PageSpec`, `QAReport`, and `PublishVersion`.

Pros:

- Easier SaaS deployment.
- Keeps Trigger/Supabase path simple.

Cons:

- High drift risk unless schema validation and compiler behavior are shared with `superpowers/`.
- Repair/retry evidence semantics must be rebuilt or wrapped.

Required app/Supabase parity contract:

- Migration adds latest refs for `DesignSpec`, `PageSpec`, `QAReport`, and `PublishVersion`.
- `generation_runs.status` distinguishes at least `queued`, `running`, `completed`, `failed`, `validating`, `qa_failed`, `review_ready`, `approved`, `export_ready`, `exported`, and `published`.
- Review/export state is stored separately from raw generation completion.
- Publish/export routes must fail closed unless the latest run has a passing `QAReport` or an explicit waiver.
- Old runs without full spine refs remain readable as legacy previews but cannot be called publish-ready.
- A parity oracle compares app-side artifacts with runner-produced artifacts for the same seeded brief and flags spine drift.

Recommended decision:

- Short term: Option B for app UX velocity, but require full spine parity before claiming harness-backed generation.
- Medium term: extract a runner API so Option A becomes possible for Pro/workbench and internal quality runs.

Non-negotiable boundary:

- Customer-facing publish/export must not rely only on `SectionGraph` + `ThemeTokens`.
- `DesignSpec` already exists in the harness path; the missing work is making the app/customer path consume or persist it.
- Until page compile or QA explicitly consumes `DesignSpec`, it is advisory context only and must not be described as compile authority.

Compile/QA contract options for `DesignSpec`:

- Compile-aware: `page-compile` reads `DesignSpec` and records `design_spec_ref` in `PageSpec.input_refs`.
- QA-aware: `verify-publishable-page` reads `DesignSpec` and checks compiled output against its design intents.
- Advisory-only: app displays `DesignSpec` as rationale, but publish/export cannot claim it affected the compiled result.

P1 should choose one of these before requiring `DesignSpec` to influence preview quality.

## 5.2 ClaimRef / ProofRef Contract

Claim compliance cannot be enforced from raw `trustSignals` strings alone.

P0 should document a structured claim/proof contract, but claim gates remain advisory until the app actually produces and persists these refs:

```json
{
  "claim_ref": "claim:hero:benefit-1:v1",
  "text": "Keeps drinks cold for 24 hours",
  "claim_type": "performance | social-proof | certification | price | guarantee | subjective",
  "strength": "stated-by-user | source-backed | measured | prohibited",
  "proof_refs": ["proof:user-input:spec-sheet:v1"],
  "locale": "en-US",
  "channel_scope": ["landing-page", "ad-creative"],
  "allowed_transformations": ["shorten", "translate-literal"],
  "prohibited_transformations": ["amplify", "add-number", "add-certification"]
}
```

`ProofRef` should include source kind, URL/file/input origin, extraction confidence, locale, and channel scope.

Rules:

- User-entered selling points are not automatically proof.
- Trust signals must name their source or stay low-proof.
- The system may shorten or clarify a claim, but must not amplify it.
- Any invented number, certification, award, discount, review count, or customer logo is blocking.
- Claim gates stay advisory until `ClaimRef` / `ProofRef` exist in persisted artifacts; after that, P0 claim rules can fail closed.

## 6. Output Mode Strategy

Fusera should not jump from landing-page-only to any-output.

Recommended output families:

### Phase 1: Landing Page

Keep and improve current path:

- landing page
- product page
- launch page
- MVP validation page

Artifacts:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `DesignSpec`
- `PageSpec`
- `QAReport`
- `PublishVersion`

### Phase 2: Commercial Image Outputs

Frozen until the P0 landing-page proof loop passes go/no-go thresholds.

Add output modes that match the target customer:

- `product-main-image`
- `marketing-poster`
- `ad-creative`
- `social-commerce-card`

These should not reuse landing-page section types directly. They need their own compact schemas.

Possible artifact spine:

```text
ProductBrief
BrandProfile
CommercialImageSpec
QAReport
ExportVersion
```

`CommercialImageSpec` should start as one artifact with nested fields instead of prematurely splitting six stable artifacts.

Suggested nested fields:

- `channel`: target platform or channel.
- `platform_constraints`: canvas size, aspect ratio, safe zones, max text density, export formats.
- `creative_brief`: message, audience, CTA, offer, locale.
- `composition`: product prominence, background treatment, text hierarchy, safe areas.
- `assets`: source image refs, allowed crops, missing asset notes.
- `claims`: `ClaimRef` and `ProofRef` bindings.
- `export_target`: filename, format, resolution, channel preset.

The nested contract should cover:

- target platform or channel
- canvas size and aspect ratio
- safe zones
- max text density
- required export formats
- platform-specific prohibited claims
- image source/evidence requirements
- claim policy and proof references
- export target metadata

The current intake shape is not enough for commercial image outputs. It needs at least target channel, target market/language, asset role, platform size preset, claim evidence, and export target.

### Phase 3: Independent Site / Funnel Outputs

Extend from single landing page to:

- multi-section product page
- mini-site
- campaign funnel
- A/B variant set

This is where artifact graph and canvas become more valuable.

## 7. Infinite Canvas Recommendation

Infinite canvas should be a Pro/workbench mode, not the default customer entry.

The right model is not a blank whiteboard. It should be an artifact graph canvas:

```text
ProductBrief
-> BrandProfile
-> PagePlan
-> SectionGraph
-> ThemeTokens
-> DesignSpec
-> PageSpec | CommercialImageSpec
-> QAReport
-> PublishVersion | ExportVersion
```

Canvas nodes should be real artifacts, not decorative cards.

Output mode, visual direction, approval state, and export/publish action are side-panel metadata or graph edges, not artifact nodes unless they have their own schema and producer stage.

Useful canvas capabilities:

- Compare variants side by side.
- Comment on a specific section/image/claim.
- Rerun a single node or stage.
- Lock approved nodes.
- Trace which inputs produced which output.
- Branch a version for another market, language, or ad channel.

Default customer flow should still be linear:

```text
Create project -> choose output -> generate -> review -> adjust -> export/publish
```

Canvas appears when the project has enough complexity to justify it.

## 8. Roadmap

### This Week

0. Lock the 4-6 week lead ICP: cross-border merchant / ad operator generating a product landing page from product images and selling points.
1. Add visual direction model and picker.
2. Add an internal `landing-page` mode constant/guard only; do not add a customer-visible output picker.
3. Add anti-slop linter skeleton as advisory app-path lint.
4. Feed linter findings into current quality scoring without calling it a canonical `QAReport` gate yet.
5. Draft app ↔ harness integration decision, app/Supabase parity contract, and `TargetRef` contract.
6. Run the seeded landing-page brief set manually and record draft-to-export/publish baseline.

Success criteria:

- The lead ICP is named in intake, examples, QA review, and roadmap language.
- A user can select a commercial visual direction during intake.
- Generated `ThemeTokens` or deterministic placeholder path changes based on direction.
- Anti-slop linter can return structured findings.
- Findings can be displayed or included in the current app quality score.
- The plan names whether `/generate` will call the runner or mirror the canonical spine.
- The team has a baseline landing-page draft-to-export/publish rate before starting Phase 2 implementation.

### 1-2 Weeks

1. Wire the existing harness `DesignSpec` into the app/customer path, or persist an app-side equivalent that matches the canonical schema.
2. Add app/Supabase parity migration for full canonical spine refs and review/export states.
3. Make publish/export fail closed on missing or failing `QAReport`, with legacy preview compatibility.
4. Curate first 3-4 landing-page commercial direction/token presets for the lead ICP.
5. Define `ClaimRef`, `ProofRef`, and `TargetRef` schemas as contract skeletons; do not hard-gate claims or build canvas/partial regeneration yet.
6. Decide whether `DesignSpec` is compile-aware, QA-aware, or advisory-only for this phase.
7. Decide whether anti-slop P0 rules block publish/export through canonical `QAReport`.

Success criteria:

- The system can distinguish landing-page QA from image/poster QA.
- Design systems can be selected without becoming arbitrary brand imitation.
- A generated artifact carries enough design rationale for review/repair.
- `DesignSpec`, `QAReport`, and export/publish refs are visible in the customer generation data path.
- Image/poster implementation is still frozen unless landing-page seeded brief metrics meet the go/no-go threshold.

### 1 Month+

1. Add artifact graph workspace.
2. Add variant comparison and comments.
3. Add section/image-level partial regeneration.
4. Add export packages for ad/social/ecommerce platforms.
5. Consider additional agent adapters only after one backend path is reliable.

Success criteria:

- Customers can move from a product input to multiple export-ready commercial assets.
- Teams can review and approve outputs without reading agent logs.
- The harness can repair failed outputs using persisted evidence.

## 9. Adoption Matrix

| Recommendation | Adopt? | Timing | Notes |
|---|---:|---|---|
| Visual direction picker | Yes | P0 | Reframe around commercial use cases. |
| Anti-slop linter | Yes | P0 | Make it executable, not just prompt guidance. |
| Design system extraction | Yes | P1 | P0 uses 3-4 curated landing presets; broader catalog later. |
| Preview-first cards | Yes | P1 | Useful for project/version gallery. |
| In-context preview comments | Parked | Later | Requires persisted `TargetRef`. |
| Output mode expansion | Conditional | Later | Frozen until landing-page proof loop passes go/no-go. |
| Skill dynamic composition | Later | P3 | Use stage profiles first; avoid premature generic platform. |
| Multi-agent/16 CLI support | No for now | Later | Codex runtime quality matters more; Claude Code remains instruction-only until adapter parity exists. |
| Open Design multi-app local topology | No | N/A | Wrong product shape for customer-facing SaaS. |
| Generic infinite canvas first screen | No | N/A | Canvas should be artifact graph, not blank workspace. |

## 10. Core Principle

Fusera should become:

> An AI commercial design pipeline for cross-border commerce, ecommerce sellers, independent brands, and MVP product teams.

It should not become:

> A generic AI design sandbox.

The strongest path is vertical depth with agent-native internals:

- Customers interact with commercial outputs and review controls.
- Agents operate behind the scenes through harness stages.
- Artifacts remain validated and inspectable.
- Compilers and verifiers keep the product reliable.
- Canvas and advanced controls appear when the user needs power, not before.
