import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { ENV } from "./config/envLoader";

// Generates a Playwright spec file per Gherkin scenario into `.features-gen`
// (gitignored) — run automatically via the `bddgen` npm script before every
// test run (see package.json `pre*` hooks). Each `.feature` file's steps are
// matched against `src/bdd/steps/**/*.steps.ts`; which fixtures (`loginPage`,
// `api`, ...) a scenario gets is inferred from whichever `createBdd(test)`
// its step definitions use, so UI and API scenarios can share this one config.
const testDir = defineBddConfig({
  features: "features/**/*.feature",
  // Step-definition files, plus the two fixture files they pull `test` from — bddgen
  // needs both UI and API fixture files directly in this list to resolve which custom
  // `test` instance (and so which fixtures) each generated scenario should import.
  steps: [
    "src/bdd/steps/**/*.steps.ts",
    "src/fixtures/testFixture.ts",
    "src/api/fixtures/apiTest.ts",
  ],
  featuresRoot: "features",
});

export default defineConfig({
  testDir,

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
