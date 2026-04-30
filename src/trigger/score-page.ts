import { task } from "@trigger.dev/sdk/v3";
import { scorePageQuality } from "@/lib/ai/quality-score";
import { createDbClient } from "@/lib/db";

export const scorePageTask = task({
  id: "score-page",
  run: async (payload: {
    runId: string;
    sectionTypes: string[];
    hasTrustSignals: boolean;
  }) => {
    const score = scorePageQuality(payload);
    const db = await createDbClient();
    const { error } = await db
      .from("generation_runs")
      .update({ quality_score: score.total })
      .eq("id", payload.runId);

    if (error) {
      throw error;
    }

    return score;
  },
});
