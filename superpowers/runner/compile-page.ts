import { mkdir, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  readValidatedArtifact,
  validateAndPersistArtifact,
  type ArtifactEnvelope
} from "./validate-artifact.ts";

export type CompilePageResult = {
  page_spec: ArtifactEnvelope;
  preview_build_ref: string;
  preview_build_path: string;
};

export async function compilePage(options: {
  runDir: string;
  contractsDir?: string;
}): Promise<CompilePageResult> {
  const contractsDir = options.contractsDir ?? path.resolve("superpowers/contracts/artifacts");
  const sectionGraph = await readValidatedArtifact(options.runDir, "SectionGraph");
  const themeTokens = await readValidatedArtifact(options.runDir, "ThemeTokens");
  const runId = sectionGraph.run_id;
  const seed = stableHash(`${sectionGraph.artifact_id}:${themeTokens.artifact_id}`);
  const pageSpecId = `page-spec_${seed.slice(0, 12)}`;
  const previewBuildRef = `preview-build_${seed.slice(12, 24)}`;
  const nodes = Array.isArray(sectionGraph.payload.nodes) ? sectionGraph.payload.nodes : [];
  const sectionOrder = Array.isArray(sectionGraph.payload.section_order)
    ? sectionGraph.payload.section_order
    : [];
  const nodeById = new Map(
    nodes
      .filter((node): node is Record<string, unknown> => typeof node === "object" && node !== null)
      .map((node) => [String(node.section_id), node])
  );
  const sections = sectionOrder.map((sectionId) => {
    const node = nodeById.get(String(sectionId));

    if (!node) {
      throw new Error(`SectionGraph references missing node ${String(sectionId)}`);
    }

    return {
      section_id: String(node.section_id),
      section_type: String(node.section_type),
      component: `landing.${String(node.section_type)}`,
      props: node.props && typeof node.props === "object" ? node.props : {}
    };
  });

  const pageSpec: ArtifactEnvelope = {
    artifact_type: "PageSpec",
    schema_version: "1.0.0",
    artifact_id: pageSpecId,
    run_id: runId,
    status: "draft",
    producer_stage: "page-compile",
    input_refs: [sectionGraph.artifact_id, themeTokens.artifact_id],
    validation: {
      valid: false,
      errors: []
    },
    payload: {
      route_id: "landing-preview",
      sections,
      token_refs: {
        theme_tokens_ref: themeTokens.artifact_id,
        colors: Object.keys((themeTokens.payload.colors as Record<string, unknown>) ?? {})
      },
      asset_refs: [],
      compile_targets: ["preview"]
    }
  };
  const validation = await validateAndPersistArtifact({
    artifact: pageSpec,
    contractsDir,
    runDir: options.runDir
  });

  if (!validation.valid) {
    throw new Error(`PageSpec failed validation: ${validation.errors.join("; ")}`);
  }

  const compiledDir = path.join(options.runDir, "compiled");
  const previewBuildPath = path.join(compiledDir, "preview-build.json");
  const previewBuild = {
    preview_build_ref: previewBuildRef,
    run_id: runId,
    page_spec_ref: validation.artifact.artifact_id,
    compiler: "deterministic-p0-stub",
    compiled_at: new Date().toISOString(),
    route_id: validation.artifact.payload.route_id,
    sections: sections.map((section) => ({
      section_id: section.section_id,
      component: section.component
    }))
  };

  await mkdir(compiledDir, { recursive: true });
  await writeFile(previewBuildPath, `${JSON.stringify(previewBuild, null, 2)}\n`, "utf8");

  return {
    page_spec: validation.artifact,
    preview_build_ref: previewBuildRef,
    preview_build_path: previewBuildPath
  };
}

function stableHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir] = process.argv.slice(2);

  if (!runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/compile-page.ts <runDir>");
    process.exit(1);
  }

  console.log(JSON.stringify(await compilePage({ runDir }), null, 2));
}
