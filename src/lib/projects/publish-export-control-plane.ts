import { createDbClient } from "@/lib/db";
import {
  pageSpecPayloadSchema,
  qaReportPayloadSchema,
} from "@/lib/domain/page-artifacts";
import {
  createReadyPublishExportOperation,
  publishExportRequestSchema,
  type PublishExportOperationType,
} from "@/lib/domain/publish-control-plane";

type LatestPublishRunRecord = {
  id: string;
  latest_qa_report_ref: string | null;
  latest_page_spec_ref: string | null;
  latest_publish_version_ref: string | null;
};

type ArtifactValidation = {
  valid?: boolean;
  errors?: unknown[];
};

type LatestArtifactRecord = {
  artifact_id: string;
  artifact_type: string;
  status: string | null;
  validation: ArtifactValidation | null;
  payload: unknown;
};

type PublishExportOperationRecord = {
  id: string;
  operation_type: PublishExportOperationType;
  status: string;
};

function isValidatedArtifact(artifact: LatestArtifactRecord) {
  return (
    artifact.status === "validated" &&
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

async function parseRequest(
  request: Request,
  defaultOperationType: PublishExportOperationType,
) {
  let rawBody = "";

  try {
    rawBody = await request.text();
  } catch {
    rawBody = "";
  }

  let body: unknown = {};

  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody) as unknown;
    } catch {
      return {
        ok: false as const,
        response: Response.json(
          { error: "Invalid JSON request body" },
          { status: 400 },
        ),
      };
    }
  }

  const parsed = publishExportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false as const,
      response: Response.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }

  const operationType = parsed.data.operationType ?? defaultOperationType;

  if (operationType !== defaultOperationType) {
    return {
      ok: false as const,
      response: Response.json(
        {
          error: `Use the ${defaultOperationType} endpoint for ${defaultOperationType} operations`,
        },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true as const,
    operationType,
    externalTarget: parsed.data.externalTarget,
  };
}

export async function handlePublishExportControlPlaneRequest(options: {
  request: Request;
  projectId: string;
  defaultOperationType: PublishExportOperationType;
}) {
  const parsedRequest = await parseRequest(
    options.request,
    options.defaultOperationType,
  );

  if (!parsedRequest.ok) {
    return parsedRequest.response;
  }

  const db = await createDbClient();
  const { data: run, error: runError } = await db
    .from("generation_runs")
    .select(
      [
        "id",
        "latest_qa_report_ref",
        "latest_page_spec_ref",
        "latest_publish_version_ref",
      ].join(", "),
    )
    .eq("project_id", options.projectId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (runError || !run) {
    return Response.json({ error: "Completed run not found" }, { status: 404 });
  }

  const latestRun = run as unknown as LatestPublishRunRecord;

  if (!latestRun.latest_page_spec_ref || !latestRun.latest_qa_report_ref) {
    return Response.json(
      {
        error: "Latest run is preview-only. PageSpec and passing QAReport are required before publish/export.",
      },
      { status: 409 },
    );
  }

  const { data: qaReport, error: qaError } = await db
    .from("artifacts")
    .select("artifact_id, artifact_type, status, validation, payload")
    .eq("artifact_id", latestRun.latest_qa_report_ref)
    .eq("artifact_type", "QAReport")
    .single();

  if (qaError || !qaReport) {
    return Response.json(
      { error: "Latest QAReport artifact is missing" },
      { status: 409 },
    );
  }

  const latestQaReport = qaReport as unknown as LatestArtifactRecord;

  if (!isValidatedArtifact(latestQaReport)) {
    return Response.json(
      { error: "Latest QAReport artifact is not validated" },
      { status: 409 },
    );
  }

  const parsedQaReport = qaReportPayloadSchema.safeParse(latestQaReport.payload);

  if (
    !parsedQaReport.success ||
    !isPublishableQaVerdict(parsedQaReport.data.verdict)
  ) {
    return Response.json(
      {
        error: "Latest QAReport is not publishable",
        details: parsedQaReport.success
          ? parsedQaReport.data.issues
          : parsedQaReport.error.flatten(),
      },
      { status: 409 },
    );
  }

  if (hasFailedNonWaivableGate(parsedQaReport.data.gate_results)) {
    return Response.json(
      { error: "Latest QAReport has failed non-waivable gates" },
      { status: 409 },
    );
  }

  if (parsedQaReport.data.page_spec_ref !== latestRun.latest_page_spec_ref) {
    return Response.json(
      { error: "Latest QAReport does not bind to the latest PageSpec" },
      { status: 409 },
    );
  }

  if (parsedQaReport.data.preview_build_ref !== `preview:${latestRun.id}`) {
    return Response.json(
      { error: "Latest QAReport does not bind to the latest preview build" },
      { status: 409 },
    );
  }

  const { data: pageSpec, error: pageSpecError } = await db
    .from("artifacts")
    .select("artifact_id, artifact_type, status, validation, payload")
    .eq("artifact_id", latestRun.latest_page_spec_ref)
    .eq("artifact_type", "PageSpec")
    .single();

  if (pageSpecError || !pageSpec) {
    return Response.json(
      { error: "Latest PageSpec artifact is missing" },
      { status: 409 },
    );
  }

  const latestPageSpec = pageSpec as unknown as LatestArtifactRecord;

  if (!isValidatedArtifact(latestPageSpec)) {
    return Response.json(
      { error: "Latest PageSpec artifact is not validated" },
      { status: 409 },
    );
  }

  const parsedPageSpec = pageSpecPayloadSchema.safeParse(latestPageSpec.payload);

  if (!parsedPageSpec.success) {
    return Response.json(
      {
        error: "Latest PageSpec artifact payload is invalid",
        details: parsedPageSpec.error.flatten(),
      },
      { status: 409 },
    );
  }

  const operation = createReadyPublishExportOperation({
    projectId: options.projectId,
    runId: latestRun.id,
    operationType: parsedRequest.operationType,
    pageSpecRef: latestRun.latest_page_spec_ref,
    qaReportRef: latestRun.latest_qa_report_ref,
    publishVersionRef: latestRun.latest_publish_version_ref ?? null,
    previewBuildRef: parsedQaReport.data.preview_build_ref,
    externalTarget: parsedRequest.externalTarget,
  });
  const { data: insertedOperation, error: operationError } = await db
    .from("publish_export_operations")
    .insert(operation)
    .select("id, operation_type, status")
    .single();

  if (operationError || !insertedOperation) {
    return Response.json(
      {
        error:
          operationError?.message ?? "Publish/export operation was not recorded",
      },
      { status: 500 },
    );
  }

  const operationRecord =
    insertedOperation as unknown as PublishExportOperationRecord;

  return Response.json({
    status: `${parsedRequest.operationType}_control_plane_ready`,
    projectId: options.projectId,
    runId: latestRun.id,
    previewReady: true,
    pageSpecRef: latestRun.latest_page_spec_ref,
    qaReportRef: latestRun.latest_qa_report_ref,
    publishVersionRef: latestRun.latest_publish_version_ref ?? null,
    previewBuildRef: parsedQaReport.data.preview_build_ref,
    operation: {
      id: operationRecord.id,
      operationType: operationRecord.operation_type,
      status: operationRecord.status,
    },
    externalExportImplemented: false,
    externalPublishingImplemented: false,
  });
}
