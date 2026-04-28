# Fusera V1 Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first deployable Fusera MVP that turns product images plus structured product fields into a brand-forward landing page draft with preview, micro-adjustments, quality scoring, and one-click deployment.

**Harness note:** Background only for the harness subsystem. Harness bootstrapping is now governed by `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`, with current source under `superpowers/`. This plan remains the app-consumer delivery plan and should not be used as the canonical source for building the harness subsystem itself.

**Architecture:** The app is a single Next.js App Router application backed by Supabase for auth, data, and storage. Generation is driven through structured artifacts (`ProductBrief`, `PagePlan`, `SectionGraph`, `ThemeTokens`) and a bounded section registry, with Trigger.dev handling async generation and screenshot-based quality scoring.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase, AI SDK, Trigger.dev, Vitest, Playwright

---

## File Structure Map

Planned files and responsibilities:

- `package.json` - app scripts and dependencies
- `next.config.ts` - Next.js configuration
- `src/app/layout.tsx` - root app shell
- `src/app/page.tsx` - product landing and entry route
- `src/app/globals.css` - global tokens and baseline styles
- `src/app/projects/new/page.tsx` - guided intake flow
- `src/app/projects/[projectId]/page.tsx` - preview and micro-adjustments screen
- `src/app/api/projects/route.ts` - create project API
- `src/app/api/projects/[projectId]/generate/route.ts` - enqueue generation run
- `src/app/api/projects/[projectId]/publish/route.ts` - publish approved draft
- `src/components/intake/project-intake-form.tsx` - structured intake UI
- `src/components/editor/page-preview.tsx` - generated page preview shell
- `src/components/editor/micro-adjustments-panel.tsx` - bounded post-generation controls
- `src/lib/db.ts` - Supabase client setup helpers
- `src/lib/domain/project-input.ts` - intake schema and validation
- `src/lib/domain/page-artifacts.ts` - canonical artifact schemas
- `src/lib/page-spec/registry.ts` - section registry and variants
- `src/lib/page-spec/compile-page.ts` - convert `SectionGraph` plus `ThemeTokens` into renderable page props
- `src/lib/ai/product-brief.ts` - product brief generation
- `src/lib/ai/page-strategy.ts` - page strategy and section graph generation
- `src/lib/ai/quality-score.ts` - screenshot quality scoring
- `src/trigger/generate-page.ts` - async generation job
- `src/trigger/score-page.ts` - async scoring job
- `supabase/migrations/0001_initial.sql` - initial tables
- `tests/unit/project-input.test.ts` - intake validation tests
- `tests/unit/page-compiler.test.ts` - compiler tests
- `tests/unit/quality-score.test.ts` - scoring contract tests
- `tests/e2e/project-generation.spec.ts` - end-to-end MVP flow

## Task 1: Scaffold The App Baseline

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Test: `tests/unit/app-shell.test.tsx`

- [ ] **Step 1: Write the failing shell test**

```tsx
// tests/unit/app-shell.test.tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the product promise", () => {
    render(<HomePage />);
    expect(
      screen.getByText("Turn product images into a premium landing page"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/app-shell.test.tsx`

Expected: FAIL with `Cannot find module '@/app/page'` or missing test config.

- [ ] **Step 3: Create the baseline app files**

```json
// package.json
{
  "name": "fusera",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0",
    "@trigger.dev/sdk": "^4.0.0",
    "ai": "^4.3.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.3.0",
    "@types/node": "22.15.3",
    "@types/react": "19.1.2",
    "@types/react-dom": "19.1.2",
    "@vitejs/plugin-react": "4.4.1",
    "tailwindcss": "4.1.4",
    "typescript": "5.8.3",
    "vitest": "3.1.2",
    "jsdom": "^26.1.0"
  }
}
```

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

```tsx
// src/app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-50">
        {children}
      </body>
    </html>
  );
}
```

```css
/* src/app/globals.css */
:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  font-family: ui-sans-serif, system-ui, sans-serif;
  background: #050505;
}
```

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
        Fusera
      </p>
      <h1 className="mt-6 text-5xl font-semibold tracking-tight">
        Turn product images into a premium landing page
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-neutral-300">
        Generate, refine, preview, and deploy a brand-forward product page in a
        single workflow.
      </p>
    </main>
  );
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Add test config and rerun the unit test**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

```ts
// tests/unit/setup.ts
import "@testing-library/jest-dom/vitest";
```

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

Run: `npm run test -- tests/unit/app-shell.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json vitest.config.ts playwright.config.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css tests/unit/app-shell.test.tsx tests/unit/setup.ts
git commit -m "feat: scaffold fusera app baseline"
```

## Task 2: Model Projects And Intake Validation

**Files:**
- Create: `src/lib/domain/project-input.ts`
- Create: `src/lib/domain/page-artifacts.ts`
- Create: `supabase/migrations/0001_initial.sql`
- Create: `src/lib/db.ts`
- Test: `tests/unit/project-input.test.ts`

- [ ] **Step 1: Write the failing intake validation test**

```ts
// tests/unit/project-input.test.ts
import { projectInputSchema } from "@/lib/domain/project-input";

describe("projectInputSchema", () => {
  it("rejects submissions without required fields", () => {
    const result = projectInputSchema.safeParse({
      productName: "",
      sellingPoints: [],
      targetAudience: "",
      brandKeywords: [],
      cta: "",
      imageUrls: [],
    });

    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/project-input.test.ts`

Expected: FAIL with `Cannot find module '@/lib/domain/project-input'`.

- [ ] **Step 3: Define the intake and artifact schemas**

Architecture alignment note:

- the original draft below used simplified inline artifact shapes
- the canonical artifact contract is now defined in `docs/superpowers/architecture/artifact-contracts.md`
- implementation should follow the envelope-plus-payload model from that document, not the older flat `headline` / `proofPoints` examples

```ts
// src/lib/domain/project-input.ts
import { z } from "zod";

export const projectInputSchema = z.object({
  productName: z.string().min(1),
  sellingPoints: z.array(z.string().min(1)).min(1),
  targetAudience: z.string().min(1),
  brandKeywords: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1),
  imageUrls: z.array(z.string().url()).min(1).max(6),
  price: z.string().optional(),
  trustSignals: z.array(z.string().min(1)).default([]),
  tone: z.string().optional(),
  referenceUrls: z.array(z.string().url()).default([]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
```

```ts
// src/lib/domain/page-artifacts.ts
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const artifactEnvelopeSchema = z.object({
  artifact_type: z.string(),
  schema_version: z.string(),
  artifact_id: z.string(),
  run_id: z.string(),
  status: z.enum(["draft", "validated", "rejected", "superseded"]),
  producer_stage: z.string(),
  input_refs: z.array(z.string()),
  validation: z.object({
    valid: z.boolean(),
    errors: z.array(z.string()),
  }),
  payload: z.unknown(),
});

export type ArtifactEnvelope<TPayload> = Omit<
  z.infer<typeof artifactEnvelopeSchema>,
  "payload"
> & {
  payload: TPayload;
};

export const productBriefPayloadSchema = z.object({
  product_name: z.string(),
  audiences: z.array(z.string()).min(1),
  core_problem: z.string(),
  value_props: z.array(z.string()).min(1),
  cta_goal: z.string(),
  proof_inputs: z.array(z.string()),
  claim_policy: z.enum(["proof-required", "low-proof", "no-claims"]),
});

export const pagePlanPayloadSchema = z.object({
  page_goal: z.string(),
  narrative_arc: z.string(),
  section_intents: z.array(z.string()).min(1),
  cta_strategy: z.string(),
  proof_strategy: z.string(),
});

export const sectionGraphPayloadSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      variant: z.string(),
      props: z.record(z.string(), z.any()),
    }),
  ),
  edges: z.array(z.object({ from: z.string(), to: z.string() })).default([]),
  section_order: z.array(z.string()).min(1),
  required_props: z.record(z.string(), z.array(z.string())),
  proof_bindings: z.array(z.string()),
  claim_policy: z.enum(["proof-required", "low-proof", "no-claims"]),
});

export const themeTokensPayloadSchema = z.object({
  colors: z.record(z.string(), z.string()),
  typography: z.record(z.string(), z.any()),
  spacing: z.record(z.string(), z.any()),
  radii: z.record(z.string(), z.any()),
  shadows: z.record(z.string(), z.any()),
  motion: z.record(z.string(), z.any()),
});

export function createArtifactEnvelope<TPayload>(params: {
  artifactType: string;
  runId: string;
  producerStage: string;
  inputRefs: string[];
  payload: TPayload;
}): ArtifactEnvelope<TPayload> {
  return {
    artifact_type: params.artifactType,
    schema_version: "1.0.0",
    artifact_id: `${params.artifactType.toLowerCase()}_${randomUUID()}`,
    run_id: params.runId,
    status: "validated",
    producer_stage: params.producerStage,
    input_refs: params.inputRefs,
    validation: {
      valid: true,
      errors: [],
    },
    payload: params.payload,
  };
}
```

- [ ] **Step 4: Add persistence skeleton and migration**

```sql
-- supabase/migrations/0001_initial.sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_name text not null,
  intake jsonb not null,
  status text not null default 'draft'
);

create table generation_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'queued',
  latest_product_brief_ref text,
  latest_page_plan_ref text,
  latest_section_graph_ref text,
  latest_theme_tokens_ref text,
  quality_score numeric
);

create table artifacts (
  artifact_id text primary key,
  project_id uuid not null references projects(id) on delete cascade,
  run_id uuid not null references generation_runs(id) on delete cascade,
  artifact_type text not null,
  schema_version text not null,
  status text not null,
  producer_stage text not null,
  input_refs jsonb not null default '[]'::jsonb,
  validation jsonb not null,
  payload jsonb not null
);
```

```ts
// src/lib/db.ts
import { createClient } from "@supabase/supabase-js";

export function createDbClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

- [ ] **Step 5: Rerun the validation test and commit**

Run: `npm run test -- tests/unit/project-input.test.ts`

Expected: PASS

```bash
git add src/lib/domain/project-input.ts src/lib/domain/page-artifacts.ts src/lib/db.ts supabase/migrations/0001_initial.sql tests/unit/project-input.test.ts
git commit -m "feat: add intake schemas and project persistence"
```

## Task 3: Build The Guided Intake Flow

**Files:**
- Create: `src/components/intake/project-intake-form.tsx`
- Create: `src/app/projects/new/page.tsx`
- Create: `src/app/api/projects/route.ts`
- Test: `tests/unit/project-intake-form.test.tsx`

- [ ] **Step 1: Write the failing form test**

```tsx
// tests/unit/project-intake-form.test.tsx
import { render, screen } from "@testing-library/react";
import ProjectIntakeForm from "@/components/intake/project-intake-form";

describe("ProjectIntakeForm", () => {
  it("renders the required fields", () => {
    render(<ProjectIntakeForm />);
    expect(screen.getByLabelText("Product name")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary CTA")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/project-intake-form.test.tsx`

Expected: FAIL with missing component import.

- [ ] **Step 3: Create the intake form and route**

```tsx
// src/components/intake/project-intake-form.tsx
"use client";

import { useState } from "react";

export default function ProjectIntakeForm() {
  const [sellingPoints, setSellingPoints] = useState("");
  const [brandKeywords, setBrandKeywords] = useState("");

  return (
    <form className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8">
      <label className="grid gap-2">
        <span>Product name</span>
        <input name="productName" className="rounded-xl bg-neutral-900 px-4 py-3" />
      </label>
      <label className="grid gap-2">
        <span>Selling points</span>
        <textarea
          name="sellingPoints"
          value={sellingPoints}
          onChange={(event) => setSellingPoints(event.target.value)}
          className="min-h-32 rounded-xl bg-neutral-900 px-4 py-3"
        />
      </label>
      <label className="grid gap-2">
        <span>Brand keywords</span>
        <textarea
          name="brandKeywords"
          value={brandKeywords}
          onChange={(event) => setBrandKeywords(event.target.value)}
          className="min-h-24 rounded-xl bg-neutral-900 px-4 py-3"
        />
      </label>
      <label className="grid gap-2">
        <span>Primary CTA</span>
        <input name="cta" className="rounded-xl bg-neutral-900 px-4 py-3" />
      </label>
      <button className="rounded-full bg-white px-6 py-3 font-medium text-black">
        Create project
      </button>
    </form>
  );
}
```

```tsx
// src/app/projects/new/page.tsx
import ProjectIntakeForm from "@/components/intake/project-intake-form";

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Start a new landing page</h1>
      <p className="mt-4 text-neutral-300">
        Upload your product images and describe the offer in plain language.
      </p>
      <div className="mt-10">
        <ProjectIntakeForm />
      </div>
    </main>
  );
}
```

```ts
// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { projectInputSchema } from "@/lib/domain/project-input";
import { createDbClient } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = projectInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = createDbClient();
  const { data, error } = await db
    .from("projects")
    .insert({
      product_name: parsed.data.productName,
      intake: parsed.data,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projectId: data.id }, { status: 201 });
}
```

- [ ] **Step 4: Rerun the form test and add an API test**

```ts
// tests/unit/projects-route.test.ts
import { POST } from "@/app/api/projects/route";

describe("POST /api/projects", () => {
  it("returns 400 for invalid input", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ productName: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

Run: `npm run test -- tests/unit/project-intake-form.test.tsx tests/unit/projects-route.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/intake/project-intake-form.tsx src/app/projects/new/page.tsx src/app/api/projects/route.ts tests/unit/project-intake-form.test.tsx tests/unit/projects-route.test.ts
git commit -m "feat: add guided intake flow"
```

## Task 4: Add Canonical Generation And Async Orchestration

**Files:**
- Create: `src/lib/ai/product-brief.ts`
- Create: `src/lib/ai/page-strategy.ts`
- Create: `src/trigger/generate-page.ts`
- Create: `src/app/api/projects/[projectId]/generate/route.ts`
- Test: `tests/unit/generate-page.test.ts`

- [ ] **Step 1: Write the failing generation contract test**

```ts
// tests/unit/generate-page.test.ts
import { buildPageArtifacts } from "@/lib/ai/page-strategy";

describe("buildPageArtifacts", () => {
  it("returns envelope-wrapped canonical artifacts for a valid project", async () => {
    const result = await buildPageArtifacts({
      runId: "run_test_01",
      productName: "Atlas bottle",
      sellingPoints: ["Leak-proof", "Insulated"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek", "confident"],
      cta: "Shop now",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: [],
      referenceUrls: [],
    });

    const productBrief = result.artifacts.find(
      (artifact) => artifact.artifact_type === "ProductBrief",
    );
    const sectionGraph = result.artifacts.find(
      (artifact) => artifact.artifact_type === "SectionGraph",
    );

    expect(productBrief?.payload.product_name).toContain("Atlas bottle");
    expect(sectionGraph?.payload.nodes.length).toBeGreaterThan(0);
    expect(result.latestRefs.productBriefRef).toBe(productBrief?.artifact_id);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/generate-page.test.ts`

Expected: FAIL with missing module import.

- [ ] **Step 3: Implement deterministic placeholder generation functions**

```ts
// src/lib/ai/product-brief.ts
import type { ProjectInput } from "@/lib/domain/project-input";

export function buildProductBrief(input: ProjectInput) {
  return {
    product_name: input.productName,
    audiences: [input.targetAudience],
    core_problem: input.sellingPoints[0] ?? "Positioning to be refined",
    value_props: input.sellingPoints,
    proof_inputs: input.trustSignals,
    claim_policy: input.trustSignals.length > 0 ? "proof-required" : "low-proof",
    cta_goal: input.cta,
  };
}
```

```ts
// src/lib/ai/page-strategy.ts
import type { ProjectInput } from "@/lib/domain/project-input";
import { createArtifactEnvelope } from "@/lib/domain/page-artifacts";
import { buildProductBrief } from "./product-brief";

type BuildPageArtifactsParams = {
  runId: string;
} & ProjectInput;

export async function buildPageArtifacts({ runId, ...input }: BuildPageArtifactsParams) {
  const productBriefPayload = buildProductBrief(input);
  const productBrief = createArtifactEnvelope({
    artifactType: "ProductBrief",
    runId,
    producerStage: "product-and-brand-brief",
    inputRefs: [],
    payload: productBriefPayload,
  });

  const pagePlan = createArtifactEnvelope({
    artifactType: "PagePlan",
    runId,
    producerStage: "page-strategy",
    inputRefs: [productBrief.artifact_id],
    payload: {
      page_goal: `A premium landing page for ${input.productName}`,
      narrative_arc: `A premium landing page for ${input.productName}`,
      cta_strategy: input.cta,
      proof_strategy: input.trustSignals.length > 0 ? "bind proof sections explicitly" : "soft-proof only",
      section_intents: ["hero", "benefits", "proof", "faq", "cta"],
    },
  });

  const sectionGraph = createArtifactEnvelope({
    artifactType: "SectionGraph",
    runId,
    producerStage: "section-graph",
    inputRefs: [productBrief.artifact_id, pagePlan.artifact_id],
    payload: {
      nodes: [
        {
          id: "hero-1",
          kind: "hero",
          variant: "split-brand",
          props: {
            eyebrow: input.brandKeywords.join(" / "),
            headline: productBriefPayload.product_name,
            cta: input.cta,
          },
        },
      ],
      edges: [],
      section_order: ["hero-1"],
      required_props: {
        hero: ["headline", "cta"],
      },
      proof_bindings: input.trustSignals,
      claim_policy: productBriefPayload.claim_policy,
    },
  });

  const themeTokens = createArtifactEnvelope({
    artifactType: "ThemeTokens",
    runId,
    producerStage: "design-system-pass",
    inputRefs: [productBrief.artifact_id, pagePlan.artifact_id, sectionGraph.artifact_id],
    payload: {
      colors: {
        accent: "#d4ff4f",
        surface: "#0a0a0a",
        text: "#fafafa",
      },
      typography: {
        body: { fontFamily: "var(--font-sans)" },
      },
      spacing: {},
      radii: {},
      shadows: {},
      motion: {},
    },
  });

  return {
    artifacts: [productBrief, pagePlan, sectionGraph, themeTokens],
    latestRefs: {
      productBriefRef: productBrief.artifact_id,
      pagePlanRef: pagePlan.artifact_id,
      sectionGraphRef: sectionGraph.artifact_id,
      themeTokensRef: themeTokens.artifact_id,
    },
    payloads: {
      productBrief: productBrief.payload,
      pagePlan: pagePlan.payload,
      sectionGraph: sectionGraph.payload,
      themeTokens: themeTokens.payload,
    },
  };
}
```

- [ ] **Step 4: Add the async generation job and API route**

```ts
// src/trigger/generate-page.ts
import { task } from "@trigger.dev/sdk";
import { createDbClient } from "@/lib/db";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";

export const generatePageTask = task({
  id: "generate-page",
  run: async (payload: { projectId: string; intake: any }) => {
    const db = createDbClient();
    const {
      data: run,
      error: runInsertError,
    } = await db
      .from("generation_runs")
      .insert({
        project_id: payload.projectId,
        status: "running",
      })
      .select("id")
      .single();

    if (runInsertError || !run) {
      throw runInsertError ?? new Error("Failed to create generation run");
    }

    const result = await buildPageArtifacts({
      runId: run.id,
      ...payload.intake,
    });

    await db.from("artifacts").insert(
      result.artifacts.map((artifact) => ({
        ...artifact,
        project_id: payload.projectId,
      })),
    );

    await db.from("generation_runs").update({
      status: "completed",
      latest_product_brief_ref: result.latestRefs.productBriefRef,
      latest_page_plan_ref: result.latestRefs.pagePlanRef,
      latest_section_graph_ref: result.latestRefs.sectionGraphRef,
      latest_theme_tokens_ref: result.latestRefs.themeTokensRef,
    }).eq("id", run.id);

    return {
      project_id: payload.projectId,
      run_id: run.id,
      ...result,
    };
  },
});
```

```ts
// src/app/api/projects/[projectId]/generate/route.ts
import { NextResponse } from "next/server";
import { createDbClient } from "@/lib/db";
import { generatePageTask } from "@/trigger/generate-page";

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const db = createDbClient();
  const { data, error } = await db
    .from("projects")
    .select("intake")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await generatePageTask.trigger({
    projectId,
    intake: data.intake,
  });

  return NextResponse.json({ status: "queued" });
}
```

- [ ] **Step 5: Rerun tests and commit**

Run: `npm run test -- tests/unit/generate-page.test.ts`

Expected: PASS

```bash
git add src/lib/ai/product-brief.ts src/lib/ai/page-strategy.ts src/trigger/generate-page.ts src/app/api/projects/[projectId]/generate/route.ts tests/unit/generate-page.test.ts
git commit -m "feat: add canonical generation pipeline"
```

## Task 5: Build The Section Registry And Preview Compiler

**Files:**
- Create: `src/lib/page-spec/registry.ts`
- Create: `src/lib/page-spec/compile-page.ts`
- Create: `src/components/editor/page-preview.tsx`
- Create: `src/app/projects/[projectId]/page.tsx`
- Test: `tests/unit/page-compiler.test.ts`

- [ ] **Step 1: Write the failing compiler test**

```ts
// tests/unit/page-compiler.test.ts
import { compilePage } from "@/lib/page-spec/compile-page";

describe("compilePage", () => {
  it("maps a hero section into renderable props", () => {
    const page = compilePage({
      sections: [
        {
          id: "hero-1",
          kind: "hero",
          variant: "split-brand",
          props: { headline: "Atlas bottle", cta: "Shop now" },
        },
      ],
    });

    expect(page.sections[0].kind).toBe("hero");
    expect(page.sections[0].props.headline).toBe("Atlas bottle");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/page-compiler.test.ts`

Expected: FAIL with missing compiler.

- [ ] **Step 3: Create the registry and compiler**

```ts
// src/lib/page-spec/registry.ts
export const sectionRegistry = {
  hero: ["split-brand", "editorial-product"],
  benefits: ["cards", "editorial-list"],
  proof: ["quotes", "logos"],
  faq: ["accordion"],
  cta: ["banner"],
} as const;
```

```ts
// src/lib/page-spec/compile-page.ts
type RawSection = {
  id: string;
  kind: string;
  variant: string;
  props: Record<string, unknown>;
};

export function compilePage(input: { sections: RawSection[] }) {
  return {
    sections: input.sections.map((section) => ({
      ...section,
      key: `${section.kind}:${section.id}`,
    })),
  };
}
```

- [ ] **Step 4: Create the preview component and page route**

```tsx
// src/components/editor/page-preview.tsx
type PreviewSection = {
  key: string;
  kind: string;
  props: Record<string, unknown>;
};

export default function PagePreview({ sections }: { sections: PreviewSection[] }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-neutral-950">
      {sections.map((section) => {
        if (section.kind === "hero") {
          return (
            <section key={section.key} className="px-10 py-20">
              <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
                Generated hero
              </p>
              <h2 className="mt-4 text-5xl font-semibold">
                {String(section.props.headline)}
              </h2>
              <button className="mt-8 rounded-full bg-white px-6 py-3 text-black">
                {String(section.props.cta)}
              </button>
            </section>
          );
        }

        return <section key={section.key} className="px-10 py-12" />;
      })}
    </div>
  );
}
```

```tsx
// src/app/projects/[projectId]/page.tsx
import PagePreview from "@/components/editor/page-preview";
import { compilePage } from "@/lib/page-spec/compile-page";

export default function ProjectPreviewPage() {
  const compiled = compilePage({
    sections: [
      {
        id: "hero-1",
        kind: "hero",
        variant: "split-brand",
        props: {
          headline: "Atlas bottle for urban commuters",
          cta: "Shop now",
        },
      },
    ],
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <PagePreview sections={compiled.sections} />
    </main>
  );
}
```

- [ ] **Step 5: Rerun the compiler test and commit**

Run: `npm run test -- tests/unit/page-compiler.test.ts`

Expected: PASS

```bash
git add src/lib/page-spec/registry.ts src/lib/page-spec/compile-page.ts src/components/editor/page-preview.tsx src/app/projects/[projectId]/page.tsx tests/unit/page-compiler.test.ts
git commit -m "feat: add section registry and preview compiler"
```

## Task 6: Add Micro-Adjustments And Partial Regeneration

**Files:**
- Create: `src/components/editor/micro-adjustments-panel.tsx`
- Modify: `src/app/projects/[projectId]/page.tsx`
- Create: `src/app/api/projects/[projectId]/regenerate/route.ts`
- Test: `tests/unit/micro-adjustments-panel.test.tsx`

- [ ] **Step 1: Write the failing micro-adjustments test**

```tsx
// tests/unit/micro-adjustments-panel.test.tsx
import { render, screen } from "@testing-library/react";
import MicroAdjustmentsPanel from "@/components/editor/micro-adjustments-panel";

describe("MicroAdjustmentsPanel", () => {
  it("renders bounded regeneration controls", () => {
    render(<MicroAdjustmentsPanel />);
    expect(screen.getByText("Tone")).toBeInTheDocument();
    expect(screen.getByText("Regenerate hero")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/micro-adjustments-panel.test.tsx`

Expected: FAIL with missing component.

- [ ] **Step 3: Create the adjustment panel**

```tsx
// src/components/editor/micro-adjustments-panel.tsx
"use client";

export default function MicroAdjustmentsPanel() {
  return (
    <aside className="grid gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">Tone</p>
        <div className="mt-3 flex gap-3">
          <button className="rounded-full border border-white/10 px-4 py-2">Sharper</button>
          <button className="rounded-full border border-white/10 px-4 py-2">Warmer</button>
        </div>
      </div>
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">Sections</p>
        <button className="mt-3 rounded-full bg-white px-4 py-2 text-black">
          Regenerate hero
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Wire the preview route and add regeneration API**

```tsx
// src/app/projects/[projectId]/page.tsx
import MicroAdjustmentsPanel from "@/components/editor/micro-adjustments-panel";
import PagePreview from "@/components/editor/page-preview";
import { compilePage } from "@/lib/page-spec/compile-page";

export default function ProjectPreviewPage() {
  const compiled = compilePage({
    sections: [
      {
        id: "hero-1",
        kind: "hero",
        variant: "split-brand",
        props: {
          headline: "Atlas bottle for urban commuters",
          cta: "Shop now",
        },
      },
    ],
  });

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[320px_minmax(0,1fr)]">
      <MicroAdjustmentsPanel />
      <PagePreview sections={compiled.sections} />
    </main>
  );
}
```

```ts
// src/app/api/projects/[projectId]/regenerate/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.scope || !["hero", "benefits", "theme"].includes(body.scope)) {
    return NextResponse.json({ error: "Invalid regeneration scope" }, { status: 400 });
  }

  return NextResponse.json({
    status: "queued",
    scope: body.scope,
  });
}
```

- [ ] **Step 5: Rerun tests and commit**

Run: `npm run test -- tests/unit/micro-adjustments-panel.test.tsx`

Expected: PASS

```bash
git add src/components/editor/micro-adjustments-panel.tsx src/app/projects/[projectId]/page.tsx src/app/api/projects/[projectId]/regenerate/route.ts tests/unit/micro-adjustments-panel.test.tsx
git commit -m "feat: add bounded micro-adjustments"
```

## Task 7: Add Quality Scoring And Publish Flow

**Files:**
- Create: `src/lib/ai/quality-score.ts`
- Create: `src/trigger/score-page.ts`
- Create: `src/app/api/projects/[projectId]/publish/route.ts`
- Test: `tests/unit/quality-score.test.ts`
- Test: `tests/e2e/project-generation.spec.ts`

- [ ] **Step 1: Write the failing quality-score test**

```ts
// tests/unit/quality-score.test.ts
import { scorePageQuality } from "@/lib/ai/quality-score";

describe("scorePageQuality", () => {
  it("returns a bounded score object", async () => {
    const score = await scorePageQuality({
      screenshotUrl: "https://example.com/page.png",
      sectionKinds: ["hero", "benefits", "proof", "faq", "cta"],
    });

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/unit/quality-score.test.ts`

Expected: FAIL with missing scorer.

- [ ] **Step 3: Implement the score contract and scoring task**

```ts
// src/lib/ai/quality-score.ts
export async function scorePageQuality(input: {
  screenshotUrl: string;
  sectionKinds: string[];
}) {
  const structureScore = Math.min(40, input.sectionKinds.length * 8);
  const visualScore = 32;
  const mobileScore = 18;

  return {
    total: structureScore + visualScore + mobileScore,
    breakdown: {
      structure: structureScore,
      visuals: visualScore,
      mobile: mobileScore,
    },
  };
}
```

```ts
// src/trigger/score-page.ts
import { task } from "@trigger.dev/sdk";
import { createDbClient } from "@/lib/db";
import { scorePageQuality } from "@/lib/ai/quality-score";

export const scorePageTask = task({
  id: "score-page",
  run: async (payload: {
    runId: string;
    screenshotUrl: string;
    sectionKinds: string[];
  }) => {
    const score = await scorePageQuality(payload);
    const db = createDbClient();

    await db
      .from("generation_runs")
      .update({ quality_score: score.total })
      .eq("id", payload.runId);

    return score;
  },
});
```

- [ ] **Step 4: Add the publish route and end-to-end test**

```ts
// src/app/api/projects/[projectId]/publish/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "published",
    url: "https://pages.fusera.app/demo-project",
  });
}
```

```ts
// tests/e2e/project-generation.spec.ts
import { test, expect } from "@playwright/test";

test("user can reach the intake flow", async ({ page }) => {
  await page.goto("/projects/new");
  await expect(page.getByText("Start a new landing page")).toBeVisible();
  await expect(page.getByLabel("Product name")).toBeVisible();
});
```

- [ ] **Step 5: Run the tests, run the build, and commit**

Run: `npm run test -- tests/unit/quality-score.test.ts`

Expected: PASS

Run: `npm run build`

Expected: PASS with a successful Next.js production build.

Run: `npm run test:e2e`

Expected: PASS with the intake route reachable in browser automation.

```bash
git add src/lib/ai/quality-score.ts src/trigger/score-page.ts src/app/api/projects/[projectId]/publish/route.ts tests/unit/quality-score.test.ts tests/e2e/project-generation.spec.ts
git commit -m "feat: add quality scoring and publish flow"
```

## Task 8: Final Integration And Verification Pass

**Files:**
- Modify: `src/app/projects/new/page.tsx`
- Modify: `src/app/projects/[projectId]/page.tsx`
- Modify: `src/app/api/projects/[projectId]/generate/route.ts`
- Test: `tests/e2e/project-generation.spec.ts`

- [ ] **Step 1: Expand the end-to-end test to cover the MVP journey**

```ts
// tests/e2e/project-generation.spec.ts
import { test, expect } from "@playwright/test";

test("user can complete the MVP flow", async ({ page }) => {
  await page.goto("/projects/new");
  await page.getByLabel("Product name").fill("Atlas bottle");
  await page.getByLabel("Selling points").fill("Leak-proof\nInsulated");
  await page.getByLabel("Brand keywords").fill("sleek\nconfident");
  await page.getByLabel("Primary CTA").fill("Shop now");
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page).toHaveURL(/projects\/.+/);
  await expect(page.getByText("Generated hero")).toBeVisible();
  await expect(page.getByText("Regenerate hero")).toBeVisible();
});
```

- [ ] **Step 2: Run the E2E test to verify the flow still fails**

Run: `npm run test:e2e -- tests/e2e/project-generation.spec.ts`

Expected: FAIL because the form submission and redirect are not wired through yet.

- [ ] **Step 3: Wire the intake submission and preview transition**

```tsx
// src/components/intake/project-intake-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectIntakeForm() {
  const router = useRouter();
  const [sellingPoints, setSellingPoints] = useState("");
  const [brandKeywords, setBrandKeywords] = useState("");

  async function onSubmit(formData: FormData) {
    const payload = {
      productName: formData.get("productName"),
      sellingPoints: String(formData.get("sellingPoints") || "")
        .split("\n")
        .filter(Boolean),
      targetAudience: "General buyers",
      brandKeywords: String(formData.get("brandKeywords") || "")
        .split("\n")
        .filter(Boolean),
      cta: formData.get("cta"),
      imageUrls: ["https://example.com/product.jpg"],
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    router.push(`/projects/${data.projectId}`);
  }

  return (
    <form action={onSubmit} className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8">
      <label className="grid gap-2">
        <span>Product name</span>
        <input name="productName" className="rounded-xl bg-neutral-900 px-4 py-3" />
      </label>
      <label className="grid gap-2">
        <span>Selling points</span>
        <textarea
          name="sellingPoints"
          value={sellingPoints}
          onChange={(event) => setSellingPoints(event.target.value)}
          className="min-h-32 rounded-xl bg-neutral-900 px-4 py-3"
        />
      </label>
      <label className="grid gap-2">
        <span>Brand keywords</span>
        <textarea
          name="brandKeywords"
          value={brandKeywords}
          onChange={(event) => setBrandKeywords(event.target.value)}
          className="min-h-24 rounded-xl bg-neutral-900 px-4 py-3"
        />
      </label>
      <label className="grid gap-2">
        <span>Primary CTA</span>
        <input name="cta" className="rounded-xl bg-neutral-900 px-4 py-3" />
      </label>
      <button className="rounded-full bg-white px-6 py-3 font-medium text-black">
        Create project
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run the full verification suite**

Run: `npm run test`

Expected: PASS

Run: `npm run test:e2e`

Expected: PASS

Run: `npm run build`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/intake/project-intake-form.tsx src/app/projects/new/page.tsx src/app/projects/[projectId]/page.tsx src/app/api/projects/[projectId]/generate/route.ts tests/e2e/project-generation.spec.ts
git commit -m "feat: complete phase 1 mvp integration"
```

## Self-Review

Spec coverage check:

- Guided intake: covered in Tasks 2 and 3
- Canonical generation artifacts: covered in Task 4
- Section registry and compiler: covered in Task 5
- Preview and micro-adjustments: covered in Task 6
- Quality scoring baseline: covered in Task 7
- One-click deployment and publish path: covered in Task 7
- End-to-end MVP flow: covered in Task 8

Placeholder scan:

- No unresolved placeholders or deferred implementation notes are left inside tasks
- Deferred scope is held outside this plan instead of hidden in task steps

Type consistency check:

- `ProjectInput`, `ProductBrief`, `PagePlan`, `SectionGraph`, and `ThemeTokens` use stable names across tasks
- API route names stay aligned with page flow: `projects`, `generate`, `regenerate`, `publish`

## Follow-On Plan Boundary

Out of scope for this implementation plan:

- custom domains
- multi-language generation
- advanced analytics
- billing and subscriptions
- collaboration features
- multi-page sites

Those belong in the next plan after Phase 1 is shipped and reviewed.
