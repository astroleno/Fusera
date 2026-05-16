import { handlePublishExportControlPlaneRequest } from "@/lib/projects/publish-export-control-plane";

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;

  return handlePublishExportControlPlaneRequest({
    request,
    projectId,
    defaultOperationType: "export",
  });
}
