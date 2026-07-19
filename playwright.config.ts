import { defineConfig } from "@playwright/test";
import { ENV } from "./config/envLoader";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",

  timeout: ENV.DEFAULT_TIMEOUT,

  expect: {
    timeout: ENV.EXPECT_TIMEOUT,
  },

  fullyParallel: true,

  workers: process.env.CI ? 2 : undefined,

  retries: process.env.CI ? 2 : 0,

  reporter: [["list"], ["html", { open: "never" }], ["allure-playwright"]],

  use: {
    baseURL: ENV.BASE_URL,

    headless: ENV.HEADLESS,

    viewport: ENV.VIEWPORT,

    locale: ENV.LOCALE,

    timezoneId: ENV.TIMEZONE,

    ignoreHTTPSErrors: true,

    screenshot: "only-on-failure",

    trace: "retain-on-failure",

    video: "retain-on-failure",

    actionTimeout: 15000,

    navigationTimeout: 30000,

    launchOptions: {
      slowMo: ENV.SLOW_MO,
    },
  },

  projects: [
    {
      name: "chromium",

      use: {
        browserName: "chromium",
      },
    },
  ],

  outputDir: "test-results",

  globalSetup: require.resolve("./config/global.setup"),

  globalTeardown: require.resolve("./config/global.teardown"),
});
