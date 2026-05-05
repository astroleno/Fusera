const allowedScopes = new Set(["hero", "features", "proof", "theme"]);

export async function POST(request: Request) {
  const body = (await request.json()) as { scope?: string };

  if (!body.scope || !allowedScopes.has(body.scope)) {
    return Response.json({ error: "Invalid regeneration scope" }, { status: 400 });
  }

  return Response.json({
    status: "queued",
    scope: body.scope,
  });
}
