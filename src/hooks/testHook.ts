import { TestInfo } from "@playwright/test";

import { Logger } from "../utils/Logger";
import { ENV } from "../../config/envLoader";

export type LifecycleLoggingFixtures = {
  frameworkLifecycleLogging: void;
};

/**
 * Auto-fixture that logs the start/end of every test — spread into the `.extend()`
 * call of `src/fixtures/testFixture.ts` and `src/api/fixtures/apiTest.ts`.
 *
 * This is deliberately a fixture rather than a `test.beforeEach()`/`test.afterEach()`
 * call: playwright-bdd (`npm run bddgen`) loads step-definition files — and whatever
 * fixtures file they import `test` from — outside an active Playwright suite while
 * discovering steps, and `test.beforeEach()` throws ("did not expect test.beforeEach()
 * to be called here") in that context. A plain `.extend()` fixture doesn't touch the
 * suite stack at module-load time, so it's safe in both contexts.
 */
export const lifecycleLoggingFixture: {
  frameworkLifecycleLogging: [
    (fixtures: object, use: () => Promise<void>, testInfo: TestInfo) => Promise<void>,
    { auto: true },
  ];
} = {
  frameworkLifecycleLogging: [
    async ({}: object, use: () => Promise<void>, testInfo: TestInfo): Promise<void> => {
      Logger.setContext(`[w${testInfo.workerIndex}] [${testInfo.title}]`);

      Logger.info("====================================");
      Logger.info(`Test        : ${testInfo.title}`);
      Logger.info(`Project     : ${testInfo.project.name}`);
      Logger.info(`Environment : ${ENV.ENVIRONMENT}`);
      Logger.info(`Retry       : ${testInfo.retry}`);
      Logger.info("====================================");

      await use();

      Logger.info("====================================");
      Logger.info(`Status   : ${testInfo.status}`);
      Logger.info(`Duration : ${testInfo.duration} ms`);
      Logger.info("====================================");

      if (testInfo.status !== testInfo.expectedStatus) {
        Logger.error(`FAILED : ${testInfo.title}`);
      }

      Logger.setContext("");
    },
    { auto: true },
  ],
};
