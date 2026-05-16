import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { GET } from "@/app/api/projects/[projectId]/operations/route";
import { inspectPublishExportDiagnostic } from "@/lib/domain/publish-control-plane";
import {
  loadLatestPublishExportOperation,
  operationRecordToInspection,
} from "@/lib/projects/load-publish-export-inspection";

function operationRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "operation_02",
    project_id: "project_01",
    run_id: "run_01",
    operation_type: "publish",
    status: "blocked",
    page_spec_ref: "page-spec_01",
    qa_report_ref: "qa-report_01",
    publish_version_ref: "publish-version_01",
    preview_build_ref: "preview:run_01",
    failure_code: "claim_ref_unknown_proof_ref",
    failure_reason: "ClaimRef points at missing ProofRef.",
    diagnostics: [
      {
        code: "claim_ref_unknown_proof_ref",
        severity: "blocking",
        message: "ClaimRef claim:reviews.1 points at missing ProofRef proof:missing.",
        artifactType: "ProductBrief",
        artifactRef: "product-brief_01",
        details: {
          claimRef: "claim:reviews.1",
          proofRef: "proof:missing",
        },
      },
    ],
    created_at: "2026-05-16T12:00:00.000Z",
    updated_at: "2026-05-16T12:00:00.000Z",
    ...overrides,
  };
}

function latestOperationQuery(data: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

describe("publish/export operation inspection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps diagnostics to stable operator remediation copy", () => {
    expect(
      inspectPublishExportDiagnostic({
        code: "claim_ref_unknown_proof_ref",
        severity: "blocking",
        message: "ClaimRef claim:reviews.1 points at missing ProofRef proof:missing.",
        artifactType: "ProductBrief",
        artifactRef: "product-brief_01",
        details: {},
      }),
    ).toMatchObject({
      operatorMessage: "A ClaimRef points at a missing ProofRef.",
      remediation: "Add the referenced ProofRef or update the ClaimRef binding.",
    });
  });

  it("normalizes operation rows for read APIs", () => {
    const inspection = operationRecordToInspection(operationRecord());

    expect(inspection).toMatchObject({
      id: "operation_02",
      projectId: "project_01",
      runId: "run_01",
      operationType: "publish",
      status: "blocked",
      failureCode: "claim_ref_unknown_proof_ref",
      diagnostics: [
        expect.objectContaining({
          code: "claim_ref_unknown_proof_ref",
          operatorMessage: "A ClaimRef points at a missing ProofRef.",
        }),
      ],
    });
  });

  it("drops invalid operation rows instead of exposing malformed state", () => {
    expect(
      operationRecordToInspection(operationRecord({ status: "half-published" })),
    ).toBeNull();
  });

  it("loads latest operation by project, run, and type", async () => {
    const query = latestOperationQuery(operationRecord({ operation_type: "export" }));
    mocks.from.mockReturnValueOnce(query);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const inspection = await loadLatestPublishExportOperation({
      projectId: "project_01",
      runId: "run_01",
      operationType: "export",
    });

    expect(inspection?.operationType).toBe("export");
    expect(mocks.from).toHaveBeenCalledWith("publish_export_operations");
    expect(query.eq).toHaveBeenCalledWith("project_id", "project_01");
    expect(query.eq).toHaveBeenCalledWith("run_id", "run_01");
    expect(query.eq).toHaveBeenCalledWith("operation_type", "export");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("returns null when no operation exists", async () => {
    mocks.from.mockReturnValueOnce(latestOperationQuery(null));
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    await expect(
      loadLatestPublishExportOperation({ projectId: "project_01" }),
    ).resolves.toBeNull();
  });

  it("GET returns latest blocked operation diagnostics", async () => {
    mocks.from.mockReturnValueOnce(latestOperationQuery(operationRecord()));
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await GET(
      new Request("http://localhost/api/projects/project_01/operations?type=publish"),
      { params: Promise.resolve({ projectId: "project_01" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.operation).toMatchObject({
      operationType: "publish",
      status: "blocked",
      diagnostics: [
        expect.objectContaining({
          code: "claim_ref_unknown_proof_ref",
          remediation: "Add the referenced ProofRef or update the ClaimRef binding.",
        }),
      ],
    });
  });

  it("GET keeps export and publish filters separate", async () => {
    const query = latestOperationQuery(operationRecord({ operation_type: "export" }));
    mocks.from.mockReturnValueOnce(query);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await GET(
      new Request(
        "http://localhost/api/projects/project_01/operations?type=export&runId=run_01",
      ),
      { params: Promise.resolve({ projectId: "project_01" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.operation.operationType).toBe("export");
    expect(query.eq).toHaveBeenCalledWith("operation_type", "export");
    expect(query.eq).toHaveBeenCalledWith("run_id", "run_01");
  });

  it("GET rejects unknown operation types", async () => {
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await GET(
      new Request("http://localhost/api/projects/project_01/operations?type=poster"),
      { params: Promise.resolve({ projectId: "project_01" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
