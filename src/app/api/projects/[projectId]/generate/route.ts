import { createDbClient } from "@/lib/db";
import { projectInputSchema } from "@/lib/domain/project-input";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const db = await createDbClient();
  const { data, error } = await db
    .from("projects")
    .select("intake")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const parsed = projectInputSchema.safeParse(data.intake);

  if (!parsed.success) {
    return Response.json(
      { error: "Project intake is invalid", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { generatePageTask } = await import("@/trigger/generate-page");
  const handle = await generatePageTask.trigger({
    projectId,
    intake: parsed.data,
  });

  return Response.json({
    status: "queued",
    runHandleId: handle.id,
  });
}
