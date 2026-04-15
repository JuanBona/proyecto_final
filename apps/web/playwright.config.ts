import { defineConfig, devices } from "@playwright/test";
import path from "path";

const workspaceRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run dev -w apps/api",
      cwd: workspaceRoot,
      port: 3001,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        DATABASE_URL: "file:./dev.db",
        ACCESS_TOKEN_SECRET: "access-secret",
        REFRESH_TOKEN_SECRET: "refresh-secret",
      },
    },
    {
      command: "npm run dev -w apps/web",
      cwd: workspaceRoot,
      url: "http://localhost:3000",
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
