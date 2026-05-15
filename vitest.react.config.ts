import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    name: "react",
    environment: "jsdom",
    exclude: ["node_modules", ".next", "reference", ".fusera"],
    globals: true,
    include: ["tests/unit/**/*.test.tsx"],
    setupFiles: ["./tests/unit/setup.ts"],
  },
});
