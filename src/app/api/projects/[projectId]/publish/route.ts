export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;

  return Response.json({
    status: "published",
    url: `https://pages.fusera.app/${projectId}`,
  });
}
