import { defineConfig } from "@playwright/test";

const useSystemChrome = process.env.CI === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3001",
    ...(useSystemChrome ? { channel: "chrome" } : {}),
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
    port: 3001,
    reuseExistingServer: false,
  },
});
