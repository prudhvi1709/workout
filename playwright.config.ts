import { defineConfig, devices } from "@playwright/test";

// Mobile-first: this app is used ~99% on phones, so the default project is a
// phone viewport. The dev server is auto-started and serves under /workout/.
const BASE = "http://localhost:5173/workout/";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
