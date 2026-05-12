import { createDbClient } from "@/lib/db";
import {
  sectionGraphPayloadSchema,
  themeTokensPayloadSchema,
} from "@/lib/domain/page-artifacts";
import { compilePage } from "@/lib/page-spec/compile-page";

export async function loadProjectPreview(projectId: string) {
  let db: Awaited<ReturnType<typeof createDbClient>>;

  try {
    db = await createDbClient();
  } catch {
    return null;
  }

  const { data: run, error: runError } = await db
    .from("generation_runs")
    .select("id, latest_section_graph_ref, latest_theme_tokens_ref, latest_design_spec_ref")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (runError || !run) {
    return null;
  }

  const artifactIds = [
    run.latest_section_graph_ref,
    run.latest_theme_tokens_ref,
    run.latest_design_spec_ref,
  ].filter(Boolean);

  const { data: artifacts, error: artifactError } = await db
    .from("artifacts")
    .select("artifact_type, payload")
    .in("artifact_id", artifactIds);

  if (artifactError || !artifacts) {
    return null;
  }

  const sectionGraph = artifacts.find(
    (artifact) => artifact.artifact_type === "SectionGraph",
  );
  const themeTokens = artifacts.find(
    (artifact) => artifact.artifact_type === "ThemeTokens",
  );

  const parsedSectionGraph = sectionGraphPayloadSchema.safeParse(
    sectionGraph?.payload,
  );
  const parsedThemeTokens = themeTokensPayloadSchema.safeParse(
    themeTokens?.payload,
  );

  if (!parsedSectionGraph.success || !parsedThemeTokens.success) {
    return null;
  }

  return compilePage({
    sectionGraph: parsedSectionGraph.data,
    themeTokens: parsedThemeTokens.data,
  });
}
