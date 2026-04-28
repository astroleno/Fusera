# Frontend Output Modes

Date: 2026-04-24  
Status: Background reference  
Purpose: Define the supported frontend and design output families and the deterministic compiler path for each

Source-of-truth note: Current harness output-mode behavior lives under `superpowers/`; current implementation rules live under `docs/superpowers/harness/` and `superpowers/`. This document is historical architecture background.

## 1. Decision Summary

Superpowers should not treat every frontend or design deliverable as "just another page build."

The harness should support two top-level families:

- `page-generation`
- `app-ui-design`

Specialized presentation and brand outputs branch from these families but still pass through bounded compilers.

## 2. Supported Output Modes

| Output Mode | Family | Agent-Produced Artifacts | Deterministic Compiler | Final Outputs | Primary Verifiers |
|---|---|---|---|---|---|
| `landing-page` | `page-generation` | `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens` | page compiler | `PageSpec`, preview build | publishable page, proof and claims, responsive/accessibility |
| `app-ui-design` | `app-ui-design` | `UXBrief`, `ScreenGraph`, `FlowSpec`, `StateMatrix`, `ComponentContract`, `ThemeTokens` | screen compiler | screen preview package, component contract bundle | UI consistency, state coverage, responsive/accessibility |
| `hi-fi-prototype` | either | `PrototypeSpec` plus referenced tokens and flows | prototype compiler | interactive HTML prototype | UI consistency, design review |
| `slides` | either | `DeckSpec` | deck compiler | HTML deck, export-ready package, optional speaker notes | publishable page, narrative consistency |
| `motion-demo` | either | `MotionSpec` or storyboard artifact | motion compiler | HTML motion source, MP4, GIF | motion smoothness, proof and claims when needed |
| `brand-asset-burst` | either | `BrandAssetSpec`, logo concepts | asset compiler | SVG bundle, showcase sheet, export package | proof and claims, brand consistency |

## 3. Page Generation Contract

The landing-page path remains the default P0 mode.

Rules:

- agents should produce structured planning and token artifacts
- the page compiler owns section assembly
- verifiers judge the compiled preview, not freeform generated code alone

## 4. App UI Design Contract

App UI work needs its own structured contract.

Recommended stable artifacts:

- `UXBrief`
- `ScreenGraph`
- `FlowSpec`
- `StateMatrix`
- `ComponentContract`
- `ThemeTokens`
- `QAReport`

This path should compile through a screen compiler rather than through the landing-page section compiler.

## 5. Specialized Output Contract

Specialized packs may bias workflow and quality bar, but they do not get to bypass deterministic compilation.

Rules:

- `PrototypeSpec` must compile through a prototype compiler
- `DeckSpec` must compile through a deck compiler
- `MotionSpec` must compile through a motion compiler
- `BrandAssetSpec` must compile through an asset compiler

If a specialized pack cannot name its structured intermediate artifact, it is not ready to be a runtime pack.

## 6. Shared QA Expectations

Every output mode should end with:

- a previewable compiled artifact
- a `QAReport`
- explicit verifier evidence
- a publish or export package only after QA success or waiver

## 7. P0 Recommendation

P0 should ship:

- `landing-page` as the production path
- `hi-fi-prototype` and `slides` as declared specialized paths with bounded compiler interfaces

`app-ui-design`, `motion-demo`, and `brand-asset-burst` may start as reserved modes with declared contracts before full implementation.
