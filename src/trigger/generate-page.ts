import { task } from "@trigger.dev/sdk/v3";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";
import { createDbClient } from "@/lib/db";
import { projectInputSchema, type ProjectInput } from "@/lib/domain/project-input";

type GeneratePagePayload = {
  projectId: string;
  intake: ProjectInput;
};

function artifactRow(
  projectId: string,
  artifact: Awaited<ReturnType<typeof buildPageArtifacts>>["artifacts"][number],
) {
  return {
    artifact_id: artifact.artifact_id,
    project_id: projectId,
    run_id: artifact.run_id,
    artifact_type: artifact.artifact_type,
    schema_version: artifact.schema_version,
    status: artifact.status,
    producer_stage: artifact.producer_stage,
    input_refs: artifact.input_refs,
    validation: artifact.validation,
    payload: artifact.payload,
  };
}

export const generatePageTask = task({
  id: "generate-page",
  run: async (payload: GeneratePagePayload) => {
    const intake = projectInputSchema.parse(payload.intake);
    const db = await createDbClient();
    const { data: run, error: runInsertError } = await db
      .from("generation_runs")
      .insert({
        project_id: payload.projectId,
        status: "running",
      })
      .select("id")
      .single();

    if (runInsertError || !run) {
      throw runInsertError ?? new Error("Failed to create generation run");
    }

    try {
      const result = await buildPageArtifacts({
        runId: run.id,
        ...intake,
      });

      const { error: artifactsInsertError } = await db
        .from("artifacts")
        .insert(
          result.artifacts.map((artifact) =>
            artifactRow(payload.projectId, artifact),
          ),
        );

      if (artifactsInsertError) {
        throw artifactsInsertError;
      }

      const { error: runUpdateError } = await db
        .from("generation_runs")
        .update({
          status: "completed",
          latest_product_brief_ref: result.latestRefs.productBriefRef,
          latest_brand_profile_ref: result.latestRefs.brandProfileRef,
          latest_page_plan_ref: result.latestRefs.pagePlanRef,
          latest_section_graph_ref: result.latestRefs.sectionGraphRef,
          latest_theme_tokens_ref: result.latestRefs.themeTokensRef,
          latest_design_spec_ref: result.latestRefs.designSpecRef,
        })
        .eq("id", run.id);

      if (runUpdateError) {
        throw runUpdateError;
      }

      return {
        project_id: payload.projectId,
        run_id: run.id,
        artifacts: result.artifacts,
        latestRefs: result.latestRefs,
      };
    } catch (error) {
      await db
        .from("generation_runs")
        .update({ status: "failed" })
        .eq("id", run.id);

      throw error;
    }
  },
});
