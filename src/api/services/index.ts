import { ApiEngine } from "../client/ApiEngine";
import { TokenManager } from "../auth/TokenManager";
import { AuthenticationService } from "./AuthenticationService";
import { EventService } from "./EventService";
import { UserService } from "./UserService";

export const createApiServices = (apiEngine: ApiEngine, tokenManager: TokenManager) => {
  return {
    auth: new AuthenticationService(apiEngine, tokenManager),
    user: new UserService(apiEngine),
    event: new EventService(apiEngine),
  } as const;
};

export type ApiServiceMap = ReturnType<typeof createApiServices>;
