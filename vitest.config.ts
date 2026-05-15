import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: ["./vitest.node.config.ts", "./vitest.react.config.ts"],
  },
});
