import { createDbClient } from "@/lib/db";
import {
  pageSpecPayloadSchema,
  qaReportPayloadSchema,
  sectionGraphPayloadSchema,
  themeTokensPayloadSchema,
} from "@/lib/domain/page-artifacts";
import {
  compilePage,
  compilePageSpec,
  type CompiledPage,
} from "@/lib/page-spec/compile-page";

export type ProjectPreview = {
  page: CompiledPage;
  mode: "page-spec" | "legacy-section-graph";
  publishReady: boolean;
  qaReportRef: string | null;
  legacyReason: string | null;
};

type LatestPreviewRunRecord = {
  id: string;
  latest_section_graph_ref: string | null;
  latest_theme_tokens_ref: string | null;
  latest_page_spec_ref: string | null;
  latest_qa_report_ref: string | null;
};

type PreviewArtifactRecord = {
  artifact_id: string;
  artifact_type: string;
  status: string | null;
  validation: {
    valid?: boolean;
    errors?: unknown[];
  } | null;
  payload: unknown;
};

function isValidatedArtifact(artifact: PreviewArtifactRecord | undefined) {
  return (
    artifact?.status === "validated" &&
    artifact.validation?.valid === true &&
    Array.isArray(artifact.validation.errors) &&
    artifact.validation.errors.length === 0
  );
}

function isPublishableQaVerdict(verdict: string) {
  return verdict === "pass";
}

function hasFailedNonWaivableGate(
  gateResults: Array<{ result: string; waivable: boolean }>,
) {
  return gateResults.some(
    (gateResult) => gateResult.result === "fail" && !gateResult.waivable,
  );
}

export async function loadProjectPreview(projectId: string) {
  let db: Awaited<ReturnType<typeof createDbClient>>;

  try {
    db = await createDbClient();
  } catch {
    return null;
  }

  const { data: run, error: runError } = await db
    .from("generation_runs")
    .select(
      [
        "id",
        "latest_section_graph_ref",
        "latest_theme_tokens_ref",
        "latest_page_spec_ref",
        "latest_qa_report_ref",
      ].join(", "),
    )
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (runError || !run) {
    return null;
  }

  const latestRun = run as unknown as LatestPreviewRunRecord;
  const artifactIds = [
    latestRun.latest_page_spec_ref,
    latestRun.latest_qa_report_ref,
    latestRun.latest_section_graph_ref,
    latestRun.latest_theme_tokens_ref,
  ].filter((artifactId): artifactId is string => Boolean(artifactId));

  const { data: artifacts, error: artifactError } = await db
    .from("artifacts")
    .select("artifact_id, artifact_type, status, validation, payload")
    .in("artifact_id", artifactIds);

  if (artifactError || !artifacts) {
    return null;
  }

  const artifactRecords = artifacts as unknown as PreviewArtifactRecord[];
  const pageSpec = artifactRecords.find(
    (artifact) =>
      artifact.artifact_id === latestRun.latest_page_spec_ref &&
      artifact.artifact_type === "PageSpec",
  );
  const qaReport = artifactRecords.find(
    (artifact) =>
      artifact.artifact_id === latestRun.latest_qa_report_ref &&
      artifact.artifact_type === "QAReport",
  );
  const sectionGraph = artifactRecords.find(
    (artifact) =>
      artifact.artifact_id === latestRun.latest_section_graph_ref &&
      artifact.artifact_type === "SectionGraph",
  );
  const themeTokens = artifactRecords.find(
    (artifact) =>
      artifact.artifact_id === latestRun.latest_theme_tokens_ref &&
      artifact.artifact_type === "ThemeTokens",
  );

  const parsedThemeTokens = themeTokensPayloadSchema.safeParse(
    themeTokens?.payload,
  );

  if (!parsedThemeTokens.success) {
    return null;
  }

  const parsedPageSpec = pageSpecPayloadSchema.safeParse(pageSpec?.payload);
  const parsedQaReport = qaReportPayloadSchema.safeParse(qaReport?.payload);

  if (latestRun.latest_page_spec_ref && !parsedPageSpec.success) {
    return null;
  }

  if (parsedPageSpec.success) {
    const publishReady =
      Boolean(latestRun.latest_qa_report_ref) &&
      isValidatedArtifact(qaReport) &&
      parsedQaReport.success &&
      isPublishableQaVerdict(parsedQaReport.data.verdict) &&
      !hasFailedNonWaivableGate(parsedQaReport.data.gate_results) &&
      parsedQaReport.data.page_spec_ref === latestRun.latest_page_spec_ref &&
      parsedQaReport.data.preview_build_ref === `preview:${latestRun.id}`;

    return {
      page: compilePageSpec({
        pageSpec: parsedPageSpec.data,
        themeTokens: parsedThemeTokens.data,
      }),
      mode: "page-spec",
      publishReady,
      qaReportRef: latestRun.latest_qa_report_ref ?? null,
      legacyReason: null,
    };
  }

  const parsedSectionGraph = sectionGraphPayloadSchema.safeParse(
    sectionGraph?.payload,
  );

  if (!parsedSectionGraph.success) {
    return null;
  }

  return {
    page: compilePage({
      sectionGraph: parsedSectionGraph.data,
      themeTokens: parsedThemeTokens.data,
    }),
    mode: "legacy-section-graph",
    publishReady: false,
    qaReportRef: null,
    legacyReason:
      "This run predates PageSpec and QAReport refs, so it can only be previewed.",
  };
}
