import { describe, expect, it } from "vitest";
import {
  projectInputToHarness,
  type WebProjectInput
} from "../../superpowers/integrations/web/project-input-to-harness.ts";

const input: WebProjectInput = {
  productName: "Fusera Studio",
  sellingPoints: ["统一生成链路", "保留质量证据"],
  productDetails: [
    { label: "运行环境", value: "Node 24" },
    { label: "执行后端", value: "Codex" }
  ],
  targetAudience: "需要稳定落地页生产的品牌团队",
  brandKeywords: ["可信", "高效"],
  cta: "开始生成",
  visualDirectionId: "editorial-tech",
  imageUrls: ["https://cdn.example.com/hero.png"],
  price: "¥999",
  trustSignals: ["完整运行证据", "可审计质量报告"],
  proofSources: [
    { claim: "统一执行入口", source: "Harness contract", url: "https://example.com/harness" },
    { claim: "Node 24 运行", source: "Runner preflight" }
  ],
  tone: "专业克制",
  referenceUrls: ["https://example.com/reference"]
};

describe("projectInputToHarness", () => {
  it("preserves Web intake fields at the canonical Harness boundary", () => {
    expect(projectInputToHarness(input)).toEqual({
      product_name: "Fusera Studio",
      audiences: ["需要稳定落地页生产的品牌团队"],
      core_problem: "需要稳定落地页生产的品牌团队需要一个能够清晰呈现Fusera Studio价值的购买页面。",
      value_props: ["统一生成链路", "保留质量证据"],
      product_details: [
        { label: "运行环境", value: "Node 24" },
        { label: "执行后端", value: "Codex" }
      ],
      cta_goal: "开始生成",
      proof_inputs: ["完整运行证据", "可审计质量报告"],
      proof_sources: [
        {
          proof_ref: "proof:1",
          claim: "统一执行入口",
          source: "Harness contract",
          url: "https://example.com/harness"
        },
        {
          proof_ref: "proof:2",
          claim: "Node 24 运行",
          source: "Runner preflight",
          url: null
        }
      ],
      claim_policy: "proof-required",
      brand_traits: ["可信", "高效"],
      tone_keywords: ["专业克制"],
      visual_directions: ["editorial-tech"],
      positioning: "统一生成链路；保留质量证据",
      do_not_use: ["未经证实的数据声明", "与已提供素材不一致的产品承诺"],
      image_urls: ["https://cdn.example.com/hero.png"],
      reference_urls: ["https://example.com/reference"],
      price: "¥999"
    });
  });

  it("assigns deterministic proof identifiers and low-proof defaults", () => {
    const withoutProof = {
      ...input,
      proofSources: [],
      tone: undefined,
      price: undefined
    };
    const first = projectInputToHarness(withoutProof);
    const second = projectInputToHarness(withoutProof);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      proof_sources: [],
      claim_policy: "low-proof",
      tone_keywords: input.brandKeywords,
      price: null
    });
  });
});
