# Fusera Phase 1 Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue Fusera app Phase 1 from completed Tasks 1-4 to a testable intake-to-preview MVP with preview rendering, bounded adjustments, quality scoring, and publish skeleton.

**Architecture:** The app already has strict project input schemas, canonical envelope-wrapped generation artifacts, Supabase persistence skeleton, guided intake, and a deterministic generation pipeline. The continuation keeps generation structured: `SectionGraph` plus `ThemeTokens` compile into renderable page sections, preview routes read persisted artifacts, and later controls mutate bounded scopes instead of accepting arbitrary DOM edits.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, Testing Library, Playwright, Zod, Supabase, Trigger.dev.

---

## Current Checkpoint

Branch: `codex/app-baseline`

Completed commits:

- `7f20029 feat(app): scaffold fusera baseline`
- `5279d38 feat(app): add intake domain model`
- `b0fd69e feat(app): add guided intake flow`
- `cc90363 feat(app): add canonical generation pipeline`

Known state:

- `npm run test` passed with 5 files / 7 tests after Task 4.
- `npm run build` passed after Task 4.
- `node --experimental-strip-types superpowers/runner/cli.ts ci mock` passed after Task 4.
- `/projects/new` exists.
- `POST /api/projects` validates and persists project intake.
- `POST /api/projects/[projectId]/generate` queues `generatePageTask`.
- Full E2E from intake submit to generated preview is not wired yet.

## File Structure Map

Planned new files:

- `src/lib/page-spec/registry.ts` - allowed section types and required prop metadata for app-side rendering.
- `src/lib/page-spec/compile-page.ts` - converts `SectionGraphPayload` and `ThemeTokensPayload` into renderable preview sections.
- `src/lib/projects/load-project-preview.ts` - reads latest completed generation artifacts for a project from Supabase.
- `src/components/editor/page-preview.tsx` - renders compiled preview sections.
- `src/components/editor/micro-adjustments-panel.tsx` - bounded post-generation controls.
- `src/lib/ai/quality-score.ts` - deterministic quality scoring contract.
- `src/trigger/score-page.ts` - Trigger task that persists quality score.
- `src/app/projects/[projectId]/page.tsx` - project preview route.
- `src/app/api/projects/[projectId]/regenerate/route.ts` - bounded regeneration API skeleton.
- `src/app/api/projects/[projectId]/publish/route.ts` - publish skeleton.
- `tests/unit/generation-route.test.ts` - valid-path tests for generation route and Trigger handoff.
- `tests/unit/page-compiler.test.ts` - compiler contract tests.
- `tests/unit/project-preview-loader.test.ts` - preview artifact loading tests.
- `tests/unit/page-preview.test.tsx` - preview rendering tests.
- `tests/unit/micro-adjustments-panel.test.tsx` - bounded controls tests.
- `tests/unit/quality-score.test.ts` - quality scoring contract tests.
- `tests/e2e/project-generation.spec.ts` - browser-level MVP flow smoke test.

Planned modified files:

- `src/components/intake/project-intake-form.tsx` - redirect to the project preview after create and start generation.
- `src/app/globals.css` - preview/editor styles using the existing CSS approach.
- `docs/superpowers/plans/2026-04-20-fusera-v1-phase-1-implementation-plan.md` - mark continuation tasks complete as they land.
- `README.md` - update status after each commit.

## Task 5: Harden Generation Handoff Tests

**Files:**

- Create: `tests/unit/generation-route.test.ts`
- Modify: `tests/unit/generate-page.test.ts`

- [ ] **Step 1: Add a valid-path route test**

Create `tests/unit/generation-route.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  trigger: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

vi.mock("@/trigger/generate-page", () => ({
  generatePageTask: {
    trigger: mocks.trigger,
  },
}));

import { POST } from "@/app/api/projects/[projectId]/generate/route";

const validIntake = {
  productName: "Atlas Bottle",
  sellingPoints: ["Leak-proof", "Insulated"],
  targetAudience: "Urban commuters",
  brandKeywords: ["sleek", "confident"],
  cta: "Shop now",
  imageUrls: ["https://example.com/product.jpg"],
  trustSignals: [],
  referenceUrls: [],
};

describe("POST /api/projects/[projectId]/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues generation for valid stored intake", async () => {
    mocks.single.mockResolvedValue({
      data: { intake: validIntake },
      error: null,
    });
    mocks.eq.mockReturnValue({ single: mocks.single });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });
    mocks.trigger.mockResolvedValue({ id: "trigger_run_01" });

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "queued", runHandleId: "trigger_run_01" });
    expect(mocks.from).toHaveBeenCalledWith("projects");
    expect(mocks.trigger).toHaveBeenCalledWith({
      projectId: "project_01",
      intake: validIntake,
    });
  });

  it("returns 422 when stored intake is malformed", async () => {
    mocks.single.mockResolvedValue({
      data: { intake: { productName: "" } },
      error: null,
    });
    mocks.eq.mockReturnValue({ single: mocks.single });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_bad" }),
    });

    expect(response.status).toBe(422);
    expect(mocks.trigger).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the focused route test**

Run:

```bash
npm run test -- tests/unit/generation-route.test.ts
```

Expected: PASS.

- [ ] **Step 3: Keep the canonical artifact test focused**

If `tests/unit/generate-page.test.ts` still imports the route, remove the route test block from that file so it only covers `buildPageArtifacts`. Keep the existing schema assertions for all five artifacts.

- [ ] **Step 4: Run the generation tests**

Run:

```bash
npm run test -- tests/unit/generate-page.test.ts tests/unit/generation-route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/generate-page.test.ts tests/unit/generation-route.test.ts
git commit -m "test(app): cover generation route handoff"
```

## Task 6: Add Page Compiler And Preview Renderer

**Files:**

- Create: `src/lib/page-spec/registry.ts`
- Create: `src/lib/page-spec/compile-page.ts`
- Create: `src/components/editor/page-preview.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/unit/page-compiler.test.ts`
- Test: `tests/unit/page-preview.test.tsx`

- [ ] **Step 1: Write the failing compiler test**

Create `tests/unit/page-compiler.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";
import { compilePage } from "@/lib/page-spec/compile-page";

describe("compilePage", () => {
  it("maps a canonical section graph into renderable sections", async () => {
    const generated = await buildPageArtifacts({
      runId: "run_test_01",
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof", "Insulated"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek", "confident"],
      cta: "Shop now",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: ["500+ reviews"],
      referenceUrls: [],
    });

    const page = compilePage({
      sectionGraph: generated.payloads.sectionGraph,
      themeTokens: generated.payloads.themeTokens,
    });

    expect(page.sections[0]).toMatchObject({
      key: "hero:hero",
      sectionId: "hero",
      sectionType: "hero",
    });
    expect(page.sections[0].props.headline).toBe("Atlas Bottle");
    expect(page.theme.colors.accent).toBe("#315f52");
  });
});
```

- [ ] **Step 2: Run the compiler test to verify it fails**

Run:

```bash
npm run test -- tests/unit/page-compiler.test.ts
```

Expected: FAIL with missing `@/lib/page-spec/compile-page`.

- [ ] **Step 3: Implement the registry**

Create `src/lib/page-spec/registry.ts`:

```ts
export const sectionRegistry = {
  hero: {
    requiredProps: ["headline", "cta_label", "image_urls"],
  },
  problem: {
    requiredProps: ["headline"],
  },
  features: {
    requiredProps: ["items"],
  },
  proof: {
    requiredProps: ["trust_signals", "claim_policy"],
  },
  cta: {
    requiredProps: ["cta_label"],
  },
  faq: {
    requiredProps: ["items"],
  },
} as const;

export type RegisteredSectionType = keyof typeof sectionRegistry;
```

- [ ] **Step 4: Implement the compiler**

Create `src/lib/page-spec/compile-page.ts`:

```ts
import type {
  SectionGraphPayload,
  ThemeTokensPayload,
} from "@/lib/domain/page-artifacts";
import { sectionRegistry, type RegisteredSectionType } from "./registry";

export type CompiledPageSection = {
  key: string;
  sectionId: string;
  sectionType: RegisteredSectionType;
  title: string;
  props: Record<string, unknown>;
};

export type CompiledPage = {
  sections: CompiledPageSection[];
  theme: ThemeTokensPayload;
};

export function compilePage(input: {
  sectionGraph: SectionGraphPayload;
  themeTokens: ThemeTokensPayload;
}): CompiledPage {
  const nodesById = new Map(
    input.sectionGraph.nodes.map((node) => [node.section_id, node]),
  );

  const sections = input.sectionGraph.section_order.map((sectionId) => {
    const node = nodesById.get(sectionId);

    if (!node) {
      throw new Error(`SectionGraph references missing section ${sectionId}`);
    }

    const sectionType = node.section_type as RegisteredSectionType;

    if (!(sectionType in sectionRegistry)) {
      throw new Error(`Unsupported section type ${node.section_type}`);
    }

    return {
      key: `${sectionType}:${node.section_id}`,
      sectionId: node.section_id,
      sectionType,
      title: node.title,
      props: node.props,
    };
  });

  return {
    sections,
    theme: input.themeTokens,
  };
}
```

- [ ] **Step 5: Add the preview component test**

Create `tests/unit/page-preview.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PagePreview from "@/components/editor/page-preview";

describe("PagePreview", () => {
  it("renders compiled hero and CTA sections", () => {
    render(
      <PagePreview
        page={{
          theme: {
            colors: {
              background: "#f7f3ec",
              surface: "#fffaf2",
              text: "#171513",
              accent: "#315f52",
            },
            typography: {},
            spacing: {},
            radii: {},
            shadows: {},
            motion: {},
          },
          sections: [
            {
              key: "hero:hero",
              sectionId: "hero",
              sectionType: "hero",
              title: "Atlas Bottle",
              props: {
                headline: "Atlas Bottle",
                subhead: "Leak-proof",
                cta_label: "Shop now",
              },
            },
            {
              key: "cta:cta",
              sectionId: "cta",
              sectionType: "cta",
              title: "Shop now",
              props: {
                cta_label: "Shop now",
              },
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Atlas Bottle" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Shop now" }).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Implement the preview component**

Create `src/components/editor/page-preview.tsx`:

```tsx
import type { CompiledPage, CompiledPageSection } from "@/lib/page-spec/compile-page";

function textProp(section: CompiledPageSection, key: string, fallback: string) {
  const value = section.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function listProp(section: CompiledPageSection, key: string) {
  const value = section.props[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export default function PagePreview({ page }: { page: CompiledPage }) {
  return (
    <div className="generated-preview">
      {page.sections.map((section) => {
        if (section.sectionType === "hero") {
          return (
            <section className="preview-section preview-hero" key={section.key}>
              <p className="eyebrow">{textProp(section, "eyebrow", "Generated page")}</p>
              <h2>{textProp(section, "headline", section.title)}</h2>
              <p>{textProp(section, "subhead", "Product benefits ready for review.")}</p>
              <button type="button">{textProp(section, "cta_label", "Review page")}</button>
            </section>
          );
        }

        if (section.sectionType === "features") {
          const items = listProp(section, "items");
          return (
            <section className="preview-section" key={section.key}>
              <h3>{section.title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          );
        }

        if (section.sectionType === "proof") {
          const trustSignals = listProp(section, "trust_signals");
          return (
            <section className="preview-section" key={section.key}>
              <h3>{section.title}</h3>
              {trustSignals.length > 0 ? (
                <ul>
                  {trustSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              ) : (
                <p>No proof claims added yet.</p>
              )}
            </section>
          );
        }

        if (section.sectionType === "cta") {
          return (
            <section className="preview-section preview-cta" key={section.key}>
              <h3>{section.title}</h3>
              <button type="button">{textProp(section, "cta_label", "Continue")}</button>
            </section>
          );
        }

        return (
          <section className="preview-section" key={section.key}>
            <h3>{section.title}</h3>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 7: Add preview CSS**

Append to `src/app/globals.css`:

```css
.generated-preview {
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--line);
}

.preview-section {
  background: var(--surface);
  padding: clamp(28px, 5vw, 64px);
}

.preview-section h2,
.preview-section h3 {
  margin: 0;
  color: var(--ink);
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 520;
  letter-spacing: 0;
}

.preview-section h2 {
  max-width: 760px;
  font-size: clamp(2.6rem, 8vw, 6rem);
  line-height: 0.95;
}

.preview-section h3 {
  font-size: clamp(1.7rem, 4vw, 3rem);
  line-height: 1.05;
}

.preview-section p,
.preview-section li {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.65;
}

.preview-section button {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: var(--accent-strong);
  color: var(--surface);
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  padding: 0 18px;
}
```

- [ ] **Step 8: Run focused tests and commit**

Run:

```bash
npm run test -- tests/unit/page-compiler.test.ts tests/unit/page-preview.test.tsx
npm run build
```

Expected: both commands PASS.

Commit:

```bash
git add src/lib/page-spec/registry.ts src/lib/page-spec/compile-page.ts src/components/editor/page-preview.tsx src/app/globals.css tests/unit/page-compiler.test.ts tests/unit/page-preview.test.tsx
git commit -m "feat(app): add preview compiler"
```

## Task 7: Add Project Preview Route Backed By Artifacts

**Files:**

- Create: `src/lib/projects/load-project-preview.ts`
- Create: `src/app/projects/[projectId]/page.tsx`
- Test: `tests/unit/project-preview-loader.test.ts`

- [ ] **Step 1: Write the loader test**

Create `tests/unit/project-preview-loader.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  single: vi.fn(),
  in: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { loadProjectPreview } from "@/lib/projects/load-project-preview";

const sectionGraphPayload = {
  nodes: [
    {
      section_id: "hero",
      section_type: "hero",
      title: "Atlas Bottle",
      props: {
        headline: "Atlas Bottle",
        cta_label: "Shop now",
        image_urls: ["https://example.com/product.jpg"],
      },
    },
  ],
  edges: [],
  section_order: ["hero"],
  required_props: {
    hero: ["headline", "cta_label", "image_urls"],
  },
  proof_bindings: [],
  claim_policy: "low-proof",
};

const themeTokensPayload = {
  colors: {
    background: "#f7f3ec",
    surface: "#fffaf2",
    text: "#171513",
    accent: "#315f52",
  },
  typography: {},
  spacing: {},
  radii: {},
  shadows: {},
  motion: {},
};

describe("loadProjectPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compiles the latest completed run artifacts", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_01",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          { artifact_type: "SectionGraph", payload: sectionGraphPayload },
          { artifact_type: "ThemeTokens", payload: themeTokensPayload },
        ],
        error: null,
      }),
    };

    mocks.from
      .mockReturnValueOnce(runQuery)
      .mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const page = await loadProjectPreview("project_01");

    expect(page?.sections[0]).toMatchObject({
      key: "hero:hero",
      sectionType: "hero",
    });
    expect(page?.theme.colors.accent).toBe("#315f52");
  });

  it("returns null when no completed run exists", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "not found" },
      }),
    };

    mocks.from.mockReturnValue(runQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    await expect(loadProjectPreview("project_missing")).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Implement `loadProjectPreview`**

Create `src/lib/projects/load-project-preview.ts`:

```ts
import { createDbClient } from "@/lib/db";
import {
  sectionGraphPayloadSchema,
  themeTokensPayloadSchema,
} from "@/lib/domain/page-artifacts";
import { compilePage } from "@/lib/page-spec/compile-page";

export async function loadProjectPreview(projectId: string) {
  const db = await createDbClient();
  const { data: run, error: runError } = await db
    .from("generation_runs")
    .select("id, latest_section_graph_ref, latest_theme_tokens_ref")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (runError || !run) {
    return null;
  }

  const artifactIds = [
    run.latest_section_graph_ref,
    run.latest_theme_tokens_ref,
  ].filter(Boolean);

  const { data: artifacts, error: artifactError } = await db
    .from("artifacts")
    .select("artifact_type, payload")
    .in("artifact_id", artifactIds);

  if (artifactError || !artifacts) {
    return null;
  }

  const sectionGraph = artifacts.find(
    (artifact) => artifact.artifact_type === "SectionGraph",
  );
  const themeTokens = artifacts.find(
    (artifact) => artifact.artifact_type === "ThemeTokens",
  );

  const parsedSectionGraph = sectionGraphPayloadSchema.safeParse(sectionGraph?.payload);
  const parsedThemeTokens = themeTokensPayloadSchema.safeParse(themeTokens?.payload);

  if (!parsedSectionGraph.success || !parsedThemeTokens.success) {
    return null;
  }

  return compilePage({
    sectionGraph: parsedSectionGraph.data,
    themeTokens: parsedThemeTokens.data,
  });
}
```

- [ ] **Step 3: Add the preview route**

Create `src/app/projects/[projectId]/page.tsx`:

```tsx
import PagePreview from "@/components/editor/page-preview";
import { loadProjectPreview } from "@/lib/projects/load-project-preview";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const page = await loadProjectPreview(projectId);

  return (
    <main className="project-page">
      <nav className="top-link" aria-label="Project navigation">
        <a href="/projects/new">New project</a>
      </nav>
      {page ? (
        <PagePreview page={page} />
      ) : (
        <section className="empty-preview">
          <p className="eyebrow">Preview pending</p>
          <h1>Generation has not finished yet</h1>
          <p className="lede">Start generation, then refresh this preview.</p>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Add route CSS**

Append to `src/app/globals.css`:

```css
.project-page {
  min-height: 100vh;
  padding: clamp(24px, 5vw, 64px);
}

.empty-preview {
  display: grid;
  align-content: center;
  min-height: 70vh;
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- tests/unit/project-preview-loader.test.ts
npm run build
```

Expected: both commands PASS.

Commit:

```bash
git add src/lib/projects/load-project-preview.ts src/app/projects/[projectId]/page.tsx src/app/globals.css tests/unit/project-preview-loader.test.ts
git commit -m "feat(app): add artifact-backed project preview"
```

## Task 8: Wire Intake Redirect And Generation Start

**Files:**

- Modify: `src/components/intake/project-intake-form.tsx`
- Test: `tests/unit/project-intake-form.test.tsx`

- [ ] **Step 1: Extend the form test**

Update `tests/unit/project-intake-form.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectIntakeForm from "@/components/intake/project-intake-form";

const router = {
  push: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("ProjectIntakeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the required fields", () => {
    render(<ProjectIntakeForm />);

    expect(screen.getByLabelText("Product name")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary CTA")).toBeInTheDocument();
  });

  it("creates a project, starts generation, and redirects to preview", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projectId: "project_01" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "queued", runHandleId: "trigger_01" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<ProjectIntakeForm />);

    fireEvent.change(screen.getByLabelText("Product name"), {
      target: { value: "Atlas Bottle" },
    });
    fireEvent.change(screen.getByLabelText("Target audience"), {
      target: { value: "Urban commuters" },
    });
    fireEvent.change(screen.getByLabelText("Selling points"), {
      target: { value: "Leak-proof\nInsulated" },
    });
    fireEvent.change(screen.getByLabelText("Brand keywords"), {
      target: { value: "sleek\nconfident" },
    });
    fireEvent.change(screen.getByLabelText("Image URLs"), {
      target: { value: "https://example.com/product.jpg" },
    });
    fireEvent.change(screen.getByLabelText("Primary CTA"), {
      target: { value: "Shop now" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/projects",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/projects/project_01/generate",
        expect.objectContaining({ method: "POST" }),
      );
      expect(router.push).toHaveBeenCalledWith("/projects/project_01");
    });
  });
});
```

- [ ] **Step 2: Update the form**

Modify `ProjectIntakeForm` so that after successful project creation it calls:

```ts
await fetch(`/api/projects/${result.projectId}/generate`, {
  method: "POST",
});
router.push(`/projects/${result.projectId}`);
```

Import `useRouter` from `next/navigation`, initialize it in the component, and keep the existing error states for invalid submission.

- [ ] **Step 3: Run test and build**

Run:

```bash
npm run test -- tests/unit/project-intake-form.test.tsx
npm run build
```

Expected: both commands PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/intake/project-intake-form.tsx tests/unit/project-intake-form.test.tsx
git commit -m "feat(app): start generation from intake"
```

## Task 9: Add Micro-Adjustments Skeleton

**Files:**

- Create: `src/components/editor/micro-adjustments-panel.tsx`
- Create: `src/app/api/projects/[projectId]/regenerate/route.ts`
- Modify: `src/app/projects/[projectId]/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/unit/micro-adjustments-panel.test.tsx`

- [ ] **Step 1: Write the controls test**

Create `tests/unit/micro-adjustments-panel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MicroAdjustmentsPanel from "@/components/editor/micro-adjustments-panel";

describe("MicroAdjustmentsPanel", () => {
  it("renders bounded regeneration controls", () => {
    render(<MicroAdjustmentsPanel projectId="project_01" />);

    expect(screen.getByRole("button", { name: "Regenerate hero" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Regenerate theme" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement controls and API**

Create `src/components/editor/micro-adjustments-panel.tsx`:

```tsx
"use client";

type MicroAdjustmentsPanelProps = {
  projectId: string;
};

async function requestRegeneration(projectId: string, scope: string) {
  await fetch(`/api/projects/${projectId}/regenerate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scope }),
  });
}

export default function MicroAdjustmentsPanel({
  projectId,
}: MicroAdjustmentsPanelProps) {
  return (
    <aside className="adjustment-panel" aria-label="Micro adjustments">
      <div>
        <p className="eyebrow">Sections</p>
        <button type="button" onClick={() => requestRegeneration(projectId, "hero")}>
          Regenerate hero
        </button>
      </div>
      <div>
        <p className="eyebrow">Theme</p>
        <button type="button" onClick={() => requestRegeneration(projectId, "theme")}>
          Regenerate theme
        </button>
      </div>
    </aside>
  );
}
```

Create `src/app/api/projects/[projectId]/regenerate/route.ts`:

```ts
const allowedScopes = new Set(["hero", "features", "proof", "theme"]);

export async function POST(request: Request) {
  const body = (await request.json()) as { scope?: string };

  if (!body.scope || !allowedScopes.has(body.scope)) {
    return Response.json({ error: "Invalid regeneration scope" }, { status: 400 });
  }

  return Response.json({
    status: "queued",
    scope: body.scope,
  });
}
```

- [ ] **Step 3: Place controls beside preview**

Modify `src/app/projects/[projectId]/page.tsx` to render `<MicroAdjustmentsPanel projectId={projectId} />` when a compiled page exists.

- [ ] **Step 4: Run tests and commit**

```bash
npm run test -- tests/unit/micro-adjustments-panel.test.tsx
npm run build
git add src/components/editor/micro-adjustments-panel.tsx src/app/api/projects/[projectId]/regenerate/route.ts src/app/projects/[projectId]/page.tsx src/app/globals.css tests/unit/micro-adjustments-panel.test.tsx
git commit -m "feat(app): add bounded adjustment controls"
```

## Task 10: Add Quality Score And Publish Skeleton

**Files:**

- Create: `src/lib/ai/quality-score.ts`
- Create: `src/trigger/score-page.ts`
- Create: `src/app/api/projects/[projectId]/publish/route.ts`
- Test: `tests/unit/quality-score.test.ts`

- [ ] **Step 1: Write the quality score test**

Create `tests/unit/quality-score.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { scorePageQuality } from "@/lib/ai/quality-score";

describe("scorePageQuality", () => {
  it("returns a bounded score object", () => {
    const score = scorePageQuality({
      sectionTypes: ["hero", "features", "proof", "cta"],
      hasTrustSignals: true,
    });

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.breakdown.structure).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Implement deterministic scoring**

Create `src/lib/ai/quality-score.ts`:

```ts
export function scorePageQuality(input: {
  sectionTypes: string[];
  hasTrustSignals: boolean;
}) {
  const structure = Math.min(40, input.sectionTypes.length * 10);
  const proof = input.hasTrustSignals ? 20 : 10;
  const visual = 28;
  const mobile = 12;

  return {
    total: Math.min(100, structure + proof + visual + mobile),
    breakdown: {
      structure,
      proof,
      visual,
      mobile,
    },
  };
}
```

- [ ] **Step 3: Add scoring task and publish route**

Create `src/trigger/score-page.ts`:

```ts
import { task } from "@trigger.dev/sdk/v3";
import { scorePageQuality } from "@/lib/ai/quality-score";
import { createDbClient } from "@/lib/db";

export const scorePageTask = task({
  id: "score-page",
  run: async (payload: {
    runId: string;
    sectionTypes: string[];
    hasTrustSignals: boolean;
  }) => {
    const score = scorePageQuality(payload);
    const db = await createDbClient();
    const { error } = await db
      .from("generation_runs")
      .update({ quality_score: score.total })
      .eq("id", payload.runId);

    if (error) {
      throw error;
    }

    return score;
  },
});
```

Create `src/app/api/projects/[projectId]/publish/route.ts`. Keep publish as a preview-safe skeleton that returns a stable fake URL until deployment integration exists:

```ts
export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;

  return Response.json({
    status: "published",
    url: `https://pages.fusera.app/${projectId}`,
  });
}
```

- [ ] **Step 4: Run tests and commit**

```bash
npm run test -- tests/unit/quality-score.test.ts
npm run build
git add src/lib/ai/quality-score.ts src/trigger/score-page.ts src/app/api/projects/[projectId]/publish/route.ts tests/unit/quality-score.test.ts
git commit -m "feat(app): add quality scoring and publish skeleton"
```

## Task 11: Browser E2E Smoke And Final Verification

**Files:**

- Create: `tests/e2e/project-generation.spec.ts`
- Modify: `playwright.config.ts` only if the command in Step 2 fails because the existing `webServer` config does not start the app.
- Modify: `README.md`

- [ ] **Step 1: Add E2E smoke for reachable routes**

Create `tests/e2e/project-generation.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("intake and preview routes render", async ({ page }) => {
  await page.goto("/projects/new");
  await expect(page.getByRole("heading", { name: "Start a new landing page" })).toBeVisible();
  await expect(page.getByLabel("Product name")).toBeVisible();

  await page.goto("/projects/demo-project");
  await expect(page.getByText(/Generation has not finished yet|Generated page/)).toBeVisible();
});
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run test
npm run build
npm run test:e2e
node --experimental-strip-types superpowers/runner/cli.ts ci mock
```

Expected: all commands PASS.

- [ ] **Step 3: Update README status**

Update `README.md` to mark preview compiler, preview route, micro-adjustments skeleton, quality scoring, and E2E smoke complete.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/project-generation.spec.ts playwright.config.ts README.md
git commit -m "test(app): add phase 1 browser smoke"
```

## Self-Review

Spec coverage:

- Guided intake is already covered by completed Tasks 2-3.
- Canonical generation artifacts are already covered by completed Task 4.
- This continuation plan covers compiler, preview route, generation redirect, micro-adjustments, quality score, publish skeleton, and E2E smoke.

Known gaps after this continuation:

- Real hosted deployment is still a skeleton.
- Real screenshot-based AI quality review is still deferred.
- Supabase-authenticated multi-user workspaces are still deferred.
- Live Trigger.dev execution needs environment-level verification outside unit tests.

Execution rule:

- After each task, run the focused test and `npm run build`.
- Before claiming a task complete, run fresh verification in the current session.
- Keep commits small and update `README.md` when product-visible status changes.
