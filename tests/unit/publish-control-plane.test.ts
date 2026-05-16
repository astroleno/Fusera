import { describe, expect, it } from "vitest";
import {
  assertPublishExportOperationTransition,
  canTransitionPublishExportOperation,
  createReadyPublishExportOperation,
  initialExportStateForCompletedGeneration,
  publishExportOperationInsertSchema,
  publishExportRequestSchema,
} from "@/lib/domain/publish-control-plane";

describe("publish/export control-plane contract", () => {
  it("parses explicit publish/export requests without external runtime fields", () => {
    expect(
      publishExportRequestSchema.safeParse({
        operationType: "publish",
        externalTarget: { channel: "shopify" },
      }).success,
    ).toBe(true);
    expect(
      publishExportRequestSchema.safeParse({
        operationType: "poster",
      }).success,
    ).toBe(false);
  });

  it("creates ready operation inserts from validated artifact refs", () => {
    const operation = createReadyPublishExportOperation({
      projectId: "project_01",
      runId: "run_01",
      operationType: "export",
      pageSpecRef: "page-spec_01",
      qaReportRef: "qa-report_01",
      publishVersionRef: "publish-version_01",
      previewBuildRef: "preview:run_01",
      externalTarget: { format: "html" },
    });

    expect(publishExportOperationInsertSchema.safeParse(operation).success).toBe(
      true,
    );
    expect(operation).toMatchObject({
      operation_type: "export",
      status: "ready",
      page_spec_ref: "page-spec_01",
      qa_report_ref: "qa-report_01",
      preview_build_ref: "preview:run_01",
      external_target: { format: "html" },
      external_result: null,
    });
  });

  it("keeps generated runs out of export-ready state until control-plane action", () => {
    expect(initialExportStateForCompletedGeneration()).toBe("none");
  });

  it("allows only explicit control-plane status transitions", () => {
    expect(canTransitionPublishExportOperation("requested", "ready")).toBe(true);
    expect(canTransitionPublishExportOperation("ready", "external_pending")).toBe(
      true,
    );
    expect(
      canTransitionPublishExportOperation(
        "external_pending",
        "external_succeeded",
      ),
    ).toBe(true);
    expect(canTransitionPublishExportOperation("ready", "external_succeeded")).toBe(
      false,
    );
    expect(() =>
      assertPublishExportOperationTransition("external_succeeded", "ready"),
    ).toThrow("Invalid publish/export transition");
  });
});
