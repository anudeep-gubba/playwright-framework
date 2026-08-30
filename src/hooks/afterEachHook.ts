import { test as base } from "@playwright/test";
import { Logger } from "../utils/Logger";

export function registerAfterEachHook(test: typeof base): void {
  test.afterEach(async ({}, testInfo) => {
    Logger.info("====================================");
    Logger.info(`Status   : ${testInfo.status}`);
    Logger.info(`Duration : ${testInfo.duration} ms`);
    Logger.info("====================================");
    if (testInfo.status !== testInfo.expectedStatus) {
      Logger.error(`FAILED : ${testInfo.title}`);
    }

    Logger.setContext("");
  });
}
