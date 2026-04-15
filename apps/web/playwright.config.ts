import { defineConfig, devices } from "@playwright/test";
import path from "path";

const workspaceRoot = path.resolve(__dirname, "../..");
const apiDbPath = path.resolve(workspaceRoot, "apps", "api", "prisma", "dev.db");

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
      command:
        `DATABASE_URL=file:${apiDbPath} ACCESS_TOKEN_SECRET=access-secret REFRESH_TOKEN_SECRET=refresh-secret npm run dev -w apps/api`,
      cwd: workspaceRoot,
      port: 3001,
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: "npm run dev -w apps/web -- --port 3000",
      cwd: workspaceRoot,
      url: "http://localhost:3000",
      reuseExistingServer: true,
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
