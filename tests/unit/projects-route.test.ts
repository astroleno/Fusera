import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/projects/route";

describe("POST /api/projects", () => {
  it("returns 400 for invalid input", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ productName: "" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
