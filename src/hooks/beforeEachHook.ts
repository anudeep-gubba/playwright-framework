import { test as base } from "@playwright/test";
import { Logger } from "../utils/Logger";
import { ENV } from "../../config/envLoader";

export function registerBeforeEachHook(test: typeof base): void {
  test.beforeEach(async ({}, testInfo) => {
    Logger.setContext(`[w${testInfo.workerIndex}] [${testInfo.title}]`);

    Logger.info("====================================");
    Logger.info(`Test        : ${testInfo.title}`);
    Logger.info(`Project     : ${testInfo.project.name}`);
    Logger.info(`Environment : ${ENV.ENVIRONMENT}`);
    Logger.info(`Retry       : ${testInfo.retry}`);
    Logger.info("====================================");
  });
}
