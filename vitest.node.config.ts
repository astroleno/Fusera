import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    name: "node",
    environment: "node",
    exclude: ["node_modules", ".next", "reference", ".fusera"],
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
  },
});
