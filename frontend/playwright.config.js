import { defineConfig } from "@playwright/test";

export default defineConfig({
  // E2E tests run against Docker Compose in CI and can target any URL via PLAYWRIGHT_BASE_URL.
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1",
    trace: "on-first-retry",
  },
});
