import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  readValidatedArtifact,
  validateAndPersistArtifact,
  type ArtifactEnvelope
} from "./validate-artifact.ts";

export type PublishPreviewResult = {
  publish_version: ArtifactEnvelope;
  handoff_path: string;
};

export async function publishPreview(options: {
  runDir: string;
  contractsDir?: string;
}): Promise<PublishPreviewResult> {
  const contractsDir = options.contractsDir ?? path.resolve("superpowers/contracts/artifacts");
  const pageSpec = await readValidatedArtifact(options.runDir, "PageSpec");
  const qaReport = await readValidatedArtifact(options.runDir, "QAReport");
  const previewBuild = JSON.parse(
    await readFile(path.join(options.runDir, "compiled", "preview-build.json"), "utf8")
  ) as Record<string, unknown>;
  const previewBuildRef = String(previewBuild.preview_build_ref);

  assertPublishable({
    pageSpec,
    qaReport,
    previewBuildRef
  });

  const seed = stableHash(`${pageSpec.artifact_id}:${qaReport.artifact_id}:${previewBuildRef}`);
  const publishVersionId = `publish-version_${seed.slice(0, 12)}`;
  const pointerTransactionRef = `preview-txn_${seed.slice(12, 24)}`;
  const previewUrl = `preview://${pageSpec.run_id}/${previewBuildRef}`;
  const publishVersion: ArtifactEnvelope = {
    artifact_type: "PublishVersion",
    schema_version: "1.0.0",
    artifact_id: publishVersionId,
    run_id: pageSpec.run_id,
    status: "draft",
    producer_stage: "publish-preview",
    input_refs: [pageSpec.artifact_id, qaReport.artifact_id, previewBuildRef],
    validation: {
      valid: false,
      errors: []
    },
    payload: {
      publish_version_id: publishVersionId,
      page_spec_ref: pageSpec.artifact_id,
      qa_report_ref: qaReport.artifact_id,
      preview_url: previewUrl,
      published_at: new Date().toISOString(),
      publish_target: "preview",
      previous_active_pointer: null,
      pointer_transaction_ref: pointerTransactionRef
    }
  };
  const validation = await validateAndPersistArtifact({
    artifact: publishVersion,
    contractsDir,
    runDir: options.runDir
  });

  if (!validation.valid) {
    throw new Error(`PublishVersion failed validation: ${validation.errors.join("; ")}`);
  }

  const previewsDir = path.join(options.runDir, "previews");
  const handoffPath = path.join(previewsDir, "publish-handoff.json");

  await mkdir(previewsDir, { recursive: true });
  await writeFile(
    handoffPath,
    `${JSON.stringify(
      {
        publish_version_ref: validation.artifact.artifact_id,
        preview_build_ref: previewBuildRef,
        preview_url: previewUrl,
        pointer_transaction_ref: pointerTransactionRef
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return {
    publish_version: validation.artifact,
    handoff_path: handoffPath
  };
}

function assertPublishable(options: {
  pageSpec: ArtifactEnvelope;
  qaReport: ArtifactEnvelope;
  previewBuildRef: string;
}): void {
  const verdict = options.qaReport.payload.verdict;

  if (verdict !== "pass" && verdict !== "waived") {
    throw new Error(`QAReport verdict ${String(verdict)} cannot be published`);
  }

  if (options.qaReport.payload.page_spec_ref !== options.pageSpec.artifact_id) {
    throw new Error("QAReport page_spec_ref does not match PageSpec");
  }

  if (options.qaReport.payload.preview_build_ref !== options.previewBuildRef) {
    throw new Error("QAReport preview_build_ref does not match preview build");
  }

  const failedNonWaivableGate = Array.isArray(options.qaReport.payload.gate_results)
    ? options.qaReport.payload.gate_results.some(
        (gate) =>
          typeof gate === "object" &&
          gate !== null &&
          (gate as Record<string, unknown>).result === "fail" &&
          (gate as Record<string, unknown>).waivable === false
      )
    : true;

  if (failedNonWaivableGate) {
    throw new Error("Publish refused because a non-waivable gate failed");
  }
}

function stableHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir] = process.argv.slice(2);

  if (!runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/publish-preview.ts <runDir>");
    process.exit(1);
  }

  console.log(JSON.stringify(await publishPreview({ runDir }), null, 2));
}
