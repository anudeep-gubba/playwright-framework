import { ApiEngine } from "../client/ApiEngine";
import { TokenManager } from "../auth/TokenManager";
import { AuthenticationService } from "./AuthenticationService";
import { EventService } from "./EventService";

export const createApiServices = (
  apiEngine: ApiEngine,
  tokenManager: TokenManager,
) => {
  return {
    auth: new AuthenticationService(apiEngine, tokenManager),
    event: new EventService(apiEngine),
  } as const;
};

export type ApiServiceMap = ReturnType<typeof createApiServices>;
