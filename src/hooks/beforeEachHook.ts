import { test } from "../fixtures/testFixture";
import { Logger } from "../utils/Logger";
import { ENV } from "../../config/envLoader";

test.beforeEach(async ({}, testInfo) => {
  Logger.info("====================================");
  Logger.info(`Test        : ${testInfo.title}`);
  Logger.info(`Project     : ${testInfo.project.name}`);
  Logger.info(`Environment : ${ENV.ENVIRONMENT}`);
  Logger.info(`Retry       : ${testInfo.retry}`);
  Logger.info("====================================");
});