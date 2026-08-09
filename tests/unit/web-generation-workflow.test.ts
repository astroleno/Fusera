import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflowPath = path.join(
  process.cwd(),
  ".github/workflows/web-generation.yml"
);

describe("Web generation workflow", () => {
  it("dispatches UUID inputs only to the dedicated Node 24 live runner", async () => {
    const workflow = await readFile(workflowPath, "utf8");

    expect(workflow).toMatch(/workflow_dispatch:\s*\n\s+inputs:/);
    expect(workflow).toMatch(/project_id:\s*\n[\s\S]*?required:\s*true/);
    expect(workflow).toMatch(/run_id:\s*\n[\s\S]*?required:\s*true/);
    expect(workflow).toContain("runs-on: [self-hosted, fusera-live]");
    expect(workflow).toMatch(/node-version:\s*["']24["']/);
    expect(workflow).toContain("npx tsx superpowers/runner/run-web-generation.ts");
    expect(workflow).toContain("--project-id \"${{ inputs.project_id }}\"");
    expect(workflow).toContain("--run-id \"${{ inputs.run_id }}\"");
  });

  it("serializes each run and retains evidence even after failure", async () => {
    const workflow = await readFile(workflowPath, "utf8");

    expect(workflow).toContain("group: web-generation-${{ inputs.run_id }}");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toMatch(
      /name:\s*Preserve secondary workflow evidence[\s\S]*?if:\s*always\(\)[\s\S]*?uses:\s*actions\/upload-artifact@v4/
    );
    expect(workflow).toContain("path: .fusera/runs/");
  });
});
