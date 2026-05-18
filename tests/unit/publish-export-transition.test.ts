import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { PATCH } from "@/app/api/projects/[projectId]/operations/[operationId]/route";

function operationRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "operation_01",
    operation_type: "publish",
    status: "ready",
    external_target: null,
    external_result: null,
    diagnostics: [],
    ...overrides,
  };
}

function transitionTable(options: {
  current: unknown;
  updated?: unknown;
  readError?: unknown;
  updateError?: unknown;
}) {
  const readQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: options.current,
      error: options.readError ?? null,
    }),
  };
  const updateSingle = vi.fn().mockResolvedValue({
    data: options.updated ?? null,
    error: options.updateError ?? null,
  });
  const updateQuery = {
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnValue({ single: updateSingle }),
  };
  const table = {
    select: vi.fn().mockReturnValue(readQuery),
    update: vi.fn().mockReturnValue(updateQuery),
  };

  return {
    table,
    readQuery,
    updateQuery,
    updateSingle,
  };
}

async function patchOperation(body: unknown) {
  return PATCH(
    new Request("http://localhost/api/projects/project_01/operations/operation_01", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    {
      params: Promise.resolve({
        projectId: "project_01",
        operationId: "operation_01",
      }),
    },
  );
}

describe("publish/export operation lifecycle transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("moves publish operations from ready to external_pending with target metadata", async () => {
    const harness = transitionTable({
      current: operationRecord({
        operation_type: "publish",
        status: "ready",
      }),
      updated: operationRecord({
        operation_type: "publish",
        status: "external_pending",
        external_target: { adapter: "noop-publish" },
      }),
    });
    mocks.from.mockReturnValue(harness.table);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await patchOperation({
      operationType: "publish",
      status: "external_pending",
      externalTarget: { adapter: "noop-publish" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "publish_operation_transitioned",
      externalPublishingImplemented: false,
      operation: {
        id: "operation_01",
        operationType: "publish",
        status: "external_pending",
        externalTarget: { adapter: "noop-publish" },
      },
    });
    expect(harness.table.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "external_pending",
        external_target: { adapter: "noop-publish" },
        updated_at: expect.any(String),
      }),
    );
    expect(harness.table.update.mock.calls[0][0]).not.toHaveProperty(
      "external_result",
    );
  });

  it("moves export operations from external_pending to external_succeeded with result metadata", async () => {
    const harness = transitionTable({
      current: operationRecord({
        operation_type: "export",
        status: "external_pending",
        external_target: { adapter: "noop-export" },
      }),
      updated: operationRecord({
        operation_type: "export",
        status: "external_succeeded",
        external_target: { adapter: "noop-export" },
        external_result: { artifactUrl: "mock://export/output.html" },
      }),
    });
    mocks.from.mockReturnValue(harness.table);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await patchOperation({
      operationType: "export",
      status: "external_succeeded",
      externalResult: { artifactUrl: "mock://export/output.html" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "export_operation_transitioned",
      externalExportImplemented: false,
      operation: {
        operationType: "export",
        status: "external_succeeded",
        externalResult: { artifactUrl: "mock://export/output.html" },
      },
    });
    expect(harness.table.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "external_succeeded",
        external_result: { artifactUrl: "mock://export/output.html" },
      }),
    );
  });

  it("rejects operation type mismatches before updating", async () => {
    const harness = transitionTable({
      current: operationRecord({
        operation_type: "export",
        status: "ready",
      }),
    });
    mocks.from.mockReturnValue(harness.table);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await patchOperation({
      operationType: "publish",
      status: "external_pending",
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      code: "operation_type_mismatch",
    });
    expect(harness.table.update).not.toHaveBeenCalled();
  });

  it("rejects illegal transitions before updating", async () => {
    const harness = transitionTable({
      current: operationRecord({
        status: "ready",
      }),
    });
    mocks.from.mockReturnValue(harness.table);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await patchOperation({
      operationType: "publish",
      status: "external_succeeded",
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      code: "invalid_transition",
      details: {
        from: "ready",
        to: "external_succeeded",
      },
    });
    expect(harness.table.update).not.toHaveBeenCalled();
  });

  it("allows external_failed operations to return to ready", async () => {
    const harness = transitionTable({
      current: operationRecord({
        status: "external_failed",
        external_result: { error: "mock adapter failed" },
      }),
      updated: operationRecord({
        status: "ready",
        external_result: { error: "mock adapter failed" },
      }),
    });
    mocks.from.mockReturnValue(harness.table);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await patchOperation({
      operationType: "publish",
      status: "ready",
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.operation).toMatchObject({
      status: "ready",
      externalResult: { error: "mock adapter failed" },
    });
    expect(harness.table.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ready" }),
    );
  });

  it("keeps terminal states immutable", async () => {
    const harness = transitionTable({
      current: operationRecord({
        status: "external_succeeded",
      }),
    });
    mocks.from.mockReturnValue(harness.table);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await patchOperation({
      operationType: "publish",
      status: "external_pending",
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      code: "invalid_transition",
      details: {
        from: "external_succeeded",
        to: "external_pending",
      },
    });
    expect(harness.table.update).not.toHaveBeenCalled();
  });
});
