import { publishExportOperationTransitionRequestSchema } from "@/lib/domain/publish-control-plane";
import { transitionPublishExportOperation } from "@/lib/projects/transition-publish-export-operation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; operationId: string }> },
) {
  const { projectId, operationId } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  const parsed = publishExportOperationTransitionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await transitionPublishExportOperation({
    projectId,
    operationId,
    request: parsed.data,
  });

  if (!result.ok) {
    return Response.json(
      {
        error: result.error.message,
        code: result.error.code,
        details: result.error.details,
      },
      { status: result.error.status },
    );
  }

  return Response.json({
    status: `${result.operation.operationType}_operation_transitioned`,
    operation: result.operation,
    externalExportImplemented: false,
    externalPublishingImplemented: false,
  });
}
