import { test as base, expect } from "@playwright/test";
import { createApiFixture, ApiFixture } from "./apiFixture";
import { registerTestHooks } from "../../hooks/testHook";

export const test = base.extend<ApiFixture>({
  api: async ({}, use, testInfo) => {
    const { api, requestContext } = await createApiFixture(testInfo);

    await use(api);

    await requestContext.dispose();
  },
});

registerTestHooks(test);

export { expect };
