import { BaseService } from "./BaseService";
import { ApiEngine } from "../client/ApiEngine";
import { TokenManager } from "../auth/TokenManager";

import { LoginRequest } from "../requests/LoginRequest";
import { LoginResponse } from "../responses/LoginResponse";

import { HttpMethod } from "../types/HttpMethod";

import { API_ENDPOINTS } from "../../constants/APIEndpoints";

export class AuthenticationService extends BaseService {
  constructor(
    api: ApiEngine,
    private readonly tokenManager: TokenManager,
  ) {
    super(api);
  }

  /**
   * Login user
   */
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.execute<LoginResponse, LoginRequest>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.AUTH.LOGIN,
      body: credentials,
    });

    this.tokenManager.setToken(response.body.token);

    return response.body;
  }

  /**
   * Clears authentication.
   */
  public logout(): void {
    this.tokenManager.clear();
  }

  /**
   * Returns current access token.
   */
  public getAccessToken(): string {
    return this.tokenManager.getToken();
  }

  /**
   * Indicates whether the user is authenticated.
   */
  public isLoggedIn(): boolean {
    return this.tokenManager.hasToken();
  }
}
