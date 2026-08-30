import { expect } from "@playwright/test";
// Extend playwright-bdd's `test` (itself an extension of @playwright/test's), not
// @playwright/test's directly — createBdd() requires the test instance used by
// Given/When/Then step files to descend from playwright-bdd's base fixtures.
import { test as base } from "playwright-bdd";
import { createApiFixture, ApiFixture } from "./apiFixture";
import { lifecycleLoggingFixture, LifecycleLoggingFixtures } from "../../hooks/testHook";

export const test = base.extend<ApiFixture & LifecycleLoggingFixtures>({
  api: async ({}, use, testInfo) => {
    const { api, requestContext } = await createApiFixture(testInfo);

    await use(api);

    await requestContext.dispose();
  },
  ...lifecycleLoggingFixture,
});

export { expect };
