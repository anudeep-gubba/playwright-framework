import { test } from "../fixtures/testFixture";
import { Logger } from "../utils/Logger";

test.afterEach(async ({}, testInfo) => {
  Logger.info("====================================");
  Logger.info(`Status   : ${testInfo.status}`);
  Logger.info(`Duration : ${testInfo.duration} ms`);
  Logger.info("====================================");

  if (testInfo.status !== testInfo.expectedStatus) {
    Logger.error(`FAILED : ${testInfo.title}`);
  }
});
