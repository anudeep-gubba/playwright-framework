import { test as base, expect, request } from "@playwright/test";
import { createApiFixture, ApiFixture } from "./apiFixture";

export const test = base.extend<ApiFixture>({
  api: async ({}, use, testInfo) => {
    const { api, requestContext } = await createApiFixture(testInfo);

    await use(api);

    await requestContext.dispose();
  },
});

export { expect };
