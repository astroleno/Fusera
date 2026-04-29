import { createDbClient } from "@/lib/db";
import { projectInputSchema } from "@/lib/domain/project-input";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = projectInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = await createDbClient();
  const { data, error } = await db
    .from("projects")
    .insert({
      product_name: parsed.data.productName,
      intake: parsed.data,
    })
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ projectId: data.id }, { status: 201 });
}
