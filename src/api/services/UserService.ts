import { BaseService } from "./BaseService";
import { ApiEngine } from "../client/ApiEngine";

import { UserProfileResponse } from "../responses/UserProfileResponse";

import { ApiResponse } from "../types/ApiResponse";
import { HttpMethod } from "../types/HttpMethod";

import { API_ENDPOINTS } from "../../constants/APIEndpoints";

export class UserService extends BaseService {
  constructor(api: ApiEngine) {
    super(api);
  }

  /**
   * Returns current logged in user profile.
   */
  public async getProfile(): Promise<ApiResponse<UserProfileResponse>> {
    return this.api.execute<UserProfileResponse>({
      method: HttpMethod.GET,
      endpoint: API_ENDPOINTS.USER.PROFILE,
    });
  }

  /**
   * Health check endpoint.
   * Useful for smoke/API availability tests.
   */
  public async health(): Promise<ApiResponse<string>> {
    return this.api.execute<string>({
      method: HttpMethod.GET,
      endpoint: "/health",
    });
  }
}
