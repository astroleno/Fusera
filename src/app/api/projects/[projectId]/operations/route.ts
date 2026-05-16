import { publishExportOperationTypeSchema } from "@/lib/domain/publish-control-plane";
import { loadLatestPublishExportOperation } from "@/lib/projects/load-publish-export-inspection";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const url = new URL(request.url);
  const operationTypeParam = url.searchParams.get("type");
  const runId = url.searchParams.get("runId") ?? undefined;
  const operationType = operationTypeParam
    ? publishExportOperationTypeSchema.safeParse(operationTypeParam)
    : null;

  if (operationTypeParam && !operationType?.success) {
    return Response.json(
      { error: "Operation type must be export or publish" },
      { status: 400 },
    );
  }

  const operation = await loadLatestPublishExportOperation({
    projectId,
    runId,
    operationType: operationType?.data,
  });

  if (!operation) {
    return Response.json({ operation: null }, { status: 200 });
  }

  return Response.json({ operation });
}
