import { APIRequestContext, request, TestInfo } from "@playwright/test";

import { ENV } from "../../../config/envLoader";

import { ApiFacade } from "../ApiFacade";
import { ApiEngine } from "../client/ApiEngine";
import { ApiScenarioContext } from "../context/ApiScenarioContext";

import { TokenManager } from "../auth/TokenManager";


export interface ApiFixture {
  api: ApiFacade;
  requestContext: APIRequestContext;
}

export async function createApiFixture(
  testInfo: TestInfo,
): Promise<ApiFixture> {
  const requestContext = await request.newContext({
    baseURL: ENV.API_BASE_URL,
    ignoreHTTPSErrors: true,
  });

  const tokenManager = new TokenManager();

  const apiEngine = new ApiEngine(requestContext, tokenManager, testInfo);

  const api = ApiFacade.create(apiEngine, tokenManager);

  return {
    api,
    requestContext,
  };
}
