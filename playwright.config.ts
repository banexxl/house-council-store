import { defineConfig, devices } from "@playwright/test"

try {
     process.loadEnvFile(".env")
} catch {
     // CI supplies real env vars instead of a .env file
}

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export default defineConfig({
     testDir: "./e2e",
     globalSetup: "./e2e/global-setup.ts",
     globalTeardown: "./e2e/global-teardown.ts",
     fullyParallel: false,
     retries: process.env.CI ? 1 : 0,
     reporter: "html",
     use: {
          baseURL,
          trace: "retain-on-failure",
          screenshot: "only-on-failure",
     },
     projects: [
          {
               name: "chromium",
               use: { ...devices["Desktop Chrome"] },
          },
     ],
     webServer: {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
     },
})
