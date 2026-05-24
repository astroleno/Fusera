import type { PublishExportOperationType } from "./publish-control-plane";
import { z } from "zod";

export const PUBLISH_EXPORT_ADAPTER_IDS = [
  "noop-export",
  "noop-publish",
  "dry-run-export",
  "dry-run-publish",
] as const;

export type PublishExportAdapterId = (typeof PUBLISH_EXPORT_ADAPTER_IDS)[number];
export type PublishExportAdapterMode = "noop" | "dry-run";

export const publishExportAdapterIdSchema = z.enum(PUBLISH_EXPORT_ADAPTER_IDS);
export const publishExportAdapterModeSchema = z.enum(["noop", "dry-run"]);
export const publishExportOperationTypeSchema = z.enum(["publish", "export"]);
export const publishExportCredentialRefSchema = z.object({
  kind: z.enum(["secret_ref", "env_ref"]),
  ref: z.string().min(1),
  scope: z.enum(["project", "workspace", "runtime"]),
});
export const publishExportProviderConfigSchema = z.object({
  provider: z.enum(["noop", "dry-run"]),
  credentialRef: publishExportCredentialRefSchema.optional(),
}).strict();
export const publishExportAdapterTargetSchema = z
  .strictObject({
    adapter: publishExportAdapterIdSchema,
    operationType: publishExportOperationTypeSchema,
    mode: publishExportAdapterModeSchema,
    externalRuntimeImplemented: z.literal(false),
    providerConfig: publishExportProviderConfigSchema.optional(),
    idempotencyKey: z.string().min(1).optional(),
    dryRun: z.literal(true).optional(),
  })
  .superRefine((target, context) => {
    if (!adapterSupportsOperation(target.adapter, target.operationType)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "adapter does not support operation type",
        path: ["operationType"],
      });
    }

    const expectedMode = adapterModeForAdapterId(target.adapter);
    if (target.mode !== expectedMode) {
      addSchemaIssue(
        context,
        ["mode"],
        "adapter mode does not match adapter id",
      );
    }

    if (expectedMode === "noop") {
      if (target.providerConfig) {
        addSchemaIssue(
          context,
          ["providerConfig"],
          "noop adapter target must not include provider config",
        );
      }

      if (target.dryRun !== undefined) {
        addSchemaIssue(
          context,
          ["dryRun"],
          "noop adapter target must not set dryRun",
        );
      }
    }

    if (expectedMode === "dry-run") {
      if (target.dryRun !== true) {
        addSchemaIssue(
          context,
          ["dryRun"],
          "dry-run adapter target requires dryRun",
        );
      }

      if (target.providerConfig?.provider !== "dry-run") {
        addSchemaIssue(
          context,
          ["providerConfig", "provider"],
          "dry-run adapter target requires dry-run provider",
        );
      }
    }
  });
export const publishExportAdapterResultSchema = z
  .strictObject({
    adapter: publishExportAdapterIdSchema,
    operationType: publishExportOperationTypeSchema,
    mode: publishExportAdapterModeSchema,
    ok: z.boolean(),
    externalRuntimeImplemented: z.literal(false),
    errorCode: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    details: z.record(z.unknown()),
  })
  .superRefine((result, context) => {
    if (!adapterSupportsOperation(result.adapter, result.operationType)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "adapter does not support operation type",
        path: ["operationType"],
      });
    }

    if (result.mode !== adapterModeForAdapterId(result.adapter)) {
      addSchemaIssue(
        context,
        ["mode"],
        "adapter result mode does not match adapter id",
      );
    }

    if (!result.ok && !result.errorCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "failed adapter result requires errorCode",
        path: ["errorCode"],
      });
    }
  });

export type PublishExportAdapterContext = {
  projectId: string;
  operationId: string;
  operationType: PublishExportOperationType;
};

export type PublishExportCredentialRef = z.infer<typeof publishExportCredentialRefSchema>;
export type PublishExportProviderConfig = z.infer<typeof publishExportProviderConfigSchema>;
export type PublishExportAdapterTarget = z.infer<typeof publishExportAdapterTargetSchema>;

export type PublishExportAdapterExecution =
  | {
      ok: true;
      details?: Record<string, unknown>;
    }
  | {
      ok: false;
      errorCode: string;
      message: string;
      details?: Record<string, unknown>;
    };

export type PublishExportAdapterResult = z.infer<typeof publishExportAdapterResultSchema>;

export type PublishExportAdapter = {
  id: PublishExportAdapterId;
  operationType: PublishExportOperationType;
  prepare(context: PublishExportAdapterContext): PublishExportAdapterTarget;
  execute(
    context: PublishExportAdapterContext,
    target: PublishExportAdapterTarget,
  ): Promise<PublishExportAdapterExecution>;
  normalizeResult(
    execution: PublishExportAdapterExecution,
  ): PublishExportAdapterResult;
};

export const noopExportAdapter = createNoopPublishExportAdapter(
  "noop-export",
  "export",
);

export const noopPublishAdapter = createNoopPublishExportAdapter(
  "noop-publish",
  "publish",
);

export const dryRunExportAdapter = createDryRunPublishExportAdapter(
  "dry-run-export",
  "export",
);

export const dryRunPublishAdapter = createDryRunPublishExportAdapter(
  "dry-run-publish",
  "publish",
);

export const PUBLISH_EXPORT_ADAPTER_REGISTRY = {
  "noop-export": noopExportAdapter,
  "noop-publish": noopPublishAdapter,
  "dry-run-export": dryRunExportAdapter,
  "dry-run-publish": dryRunPublishAdapter,
} satisfies Record<PublishExportAdapterId, PublishExportAdapter>;

export function noopAdapterForOperationType(
  operationType: PublishExportOperationType,
) {
  return operationType === "export" ? noopExportAdapter : noopPublishAdapter;
}

export function dryRunAdapterForOperationType(
  operationType: PublishExportOperationType,
) {
  return operationType === "export" ? dryRunExportAdapter : dryRunPublishAdapter;
}

export function getPublishExportAdapter(
  adapterId: PublishExportAdapterId,
): PublishExportAdapter {
  return PUBLISH_EXPORT_ADAPTER_REGISTRY[adapterId];
}

export function parsePublishExportAdapterTarget(
  value: unknown,
): PublishExportAdapterTarget {
  return publishExportAdapterTargetSchema.parse(value);
}

export function parsePublishExportAdapterResult(
  value: unknown,
): PublishExportAdapterResult {
  return publishExportAdapterResultSchema.parse(value);
}

function adapterSupportsOperation(
  adapterId: PublishExportAdapterId,
  operationType: PublishExportOperationType,
): boolean {
  return adapterId.endsWith(`-${operationType}`);
}

function adapterModeForAdapterId(
  adapterId: PublishExportAdapterId,
): PublishExportAdapterMode {
  return adapterId.startsWith("dry-run-") ? "dry-run" : "noop";
}

function addSchemaIssue(
  context: z.RefinementCtx,
  path: Array<string | number>,
  message: string,
) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    message,
    path,
  });
}

function createNoopPublishExportAdapter(
  id: PublishExportAdapterId,
  operationType: PublishExportOperationType,
): PublishExportAdapter {
  return {
    id,
    operationType,
    prepare() {
      return {
        adapter: id,
        operationType,
        mode: "noop",
        externalRuntimeImplemented: false,
      };
    },
    async execute() {
      return {
        ok: true,
        details: {
          externalRuntime: "not_implemented",
        },
      };
    },
    normalizeResult(execution) {
      return {
        adapter: id,
        operationType,
        mode: "noop",
        ok: execution.ok,
        externalRuntimeImplemented: false,
        ...(execution.ok
          ? {}
          : {
              errorCode: execution.errorCode,
              message: execution.message,
            }),
        details: execution.details ?? {},
      };
    },
  };
}

function createDryRunPublishExportAdapter(
  id: PublishExportAdapterId,
  operationType: PublishExportOperationType,
): PublishExportAdapter {
  return {
    id,
    operationType,
    prepare(context) {
      return {
        adapter: id,
        operationType,
        mode: "dry-run",
        externalRuntimeImplemented: false,
        dryRun: true,
        providerConfig: {
          provider: "dry-run",
          credentialRef: {
            kind: "secret_ref",
            ref: `publish-export/${operationType}/dry-run`,
            scope: "runtime",
          },
        },
        idempotencyKey: `${context.operationId}:${id}`,
      };
    },
    async execute() {
      return {
        ok: true,
        details: {
          externalRuntime: "not_implemented",
          dryRun: true,
        },
      };
    },
    normalizeResult(execution) {
      return {
        adapter: id,
        operationType,
        mode: "dry-run",
        ok: execution.ok,
        externalRuntimeImplemented: false,
        ...(execution.ok
          ? {}
          : {
              errorCode: execution.errorCode,
              message: execution.message,
            }),
        details: {
          dryRun: true,
          ...(execution.details ?? {}),
        },
      };
    },
  };
}
