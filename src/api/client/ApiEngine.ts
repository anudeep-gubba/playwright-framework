import {
  APIRequestContext,
  APIResponse as PlaywrightResponse,
  TestInfo,
} from "@playwright/test";

import { Logger } from "../../utils/Logger";
import { RequestResponseAttachment } from "../../reporting/RequestResponseAttachment";

import { TokenManager } from "../auth/TokenManager";
import { RetryPolicy } from "./RetryPolicy";

import { ApiRequest } from "../types/ApiRequest";
import { ApiResponse } from "../types/ApiResponse";
import { ApiHeaders } from "../types/ApiHeaders";
import { HttpMethod } from "../types/HttpMethod";

import {
  ApiException,
  AuthenticationException,
  ResourceNotFoundException,
  ServerException,
  ValidationException,
} from "../exception";

export class ApiEngine {
  constructor(
    private readonly requestContext: APIRequestContext,
    private readonly tokenManager: TokenManager,
    private readonly testInfo: TestInfo,
  ) {}

  public async execute<TResponse, TRequest = unknown>(
    request: ApiRequest<TRequest>,
  ): Promise<ApiResponse<TResponse>> {
    const start = Date.now();

    const headers = this.buildHeaders(request.headers);

    const url = this.buildUrl(request.endpoint, request.queryParams);

    this.logRequest(request, url, headers);

    await this.attachRequest(request, headers);

    try {
      const retryPolicy = new RetryPolicy({ maxRetries: request.retries ?? 0 });

      const response = await retryPolicy.execute(async () =>
        this.send(request, url, headers),
      );

      const duration = Date.now() - start;

      const body = await this.parseResponse<TResponse>(response);

      const apiResponse: ApiResponse<TResponse> = {
        status: response.status(),
        ok: response.ok(),
        headers: response.headers(),
        duration,
        body,
      };

      this.validateResponse(apiResponse, request);

      await this.attachResponse(apiResponse);

      this.logResponse(apiResponse, url, duration);

      return apiResponse;
    } catch (error) {
      Logger.error(
        `[API] ${request.method} ${url} failed: ${
          error instanceof Error ? error.stack : String(error)
        }`,
      );

      throw this.handleException(error);
    }
  }

  // -------------------------------------------------------
  // Request Helpers
  // -------------------------------------------------------
  private buildHeaders(customHeaders?: ApiHeaders): ApiHeaders {
    const headers: ApiHeaders = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...customHeaders,
    };
    if (this.tokenManager.hasToken()) {
      headers.Authorization = `Bearer ${this.tokenManager.getToken()}`;
    }

    return headers;
  }
  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | undefined>,
  ): string {
    if (!queryParams) {
      return endpoint;
    }

    const params = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    return params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
  }

  private async send<TRequest>(
    request: ApiRequest<TRequest>,
    url: string,
    headers: ApiHeaders,
  ): Promise<PlaywrightResponse> {
    const options = {
      headers,
      data: request.body,
      timeout: request.timeout,
    };
    switch (request.method) {
      case HttpMethod.GET:
        return this.requestContext.get(url, {
          headers,
          timeout: request.timeout,
        });

      case HttpMethod.POST:
        return this.requestContext.post(url, options);

      case HttpMethod.PUT:
        return this.requestContext.put(url, options);

      case HttpMethod.PATCH:
        return this.requestContext.patch(url, options);

      case HttpMethod.DELETE:
        return this.requestContext.delete(url, options);

      default:
        throw new Error(`Unsupported HTTP method: ${request.method}`);
    }
  }

  private async parseResponse<T>(response: PlaywrightResponse): Promise<T> {
    const contentType = response.headers()["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;
  }
  private async attachRequest(
    request: ApiRequest,
    headers: ApiHeaders,
  ): Promise<void> {
    await RequestResponseAttachment.attachHeaders(this.testInfo, headers);

    await RequestResponseAttachment.attachRequest(this.testInfo, request);
  }

  private async attachResponse<T>(response: ApiResponse<T>): Promise<void> {
    await RequestResponseAttachment.attachResponse(this.testInfo, response);
  }

  private logRequest<TRequest>(
    request: ApiRequest<TRequest>,
    url: string,
    headers: ApiHeaders,
  ): void {
    Logger.info(`[API] Request -> ${request.method} ${url}`);
    Logger.debug(
      `[API] Request headers -> ${JSON.stringify(
        this.redactHeaders(headers),
      )}`,
    );
    if (request.body !== undefined) {
      Logger.info(
        `[API] Request body -> ${JSON.stringify(request.body, null, 2)}`,
      );
    }
  }

  private logResponse<TResponse>(
    response: ApiResponse<TResponse>,
    url: string,
    duration: number,
  ): void {
    Logger.info(
      `[API] Response <- ${url} [${response.status}] ${duration} ms`,
    );
    Logger.debug(
      `[API] Response headers -> ${JSON.stringify(response.headers)}`,
    );
    Logger.info(
      `[API] Response body -> ${JSON.stringify(response.body, null, 2)}`,
    );
  }
  private redactHeaders(headers: ApiHeaders): ApiHeaders {
    const safeHeaders = { ...headers };
    if (safeHeaders.Authorization) {
      safeHeaders.Authorization = "*****";
    }

    return safeHeaders;
  }
  // -------------------------------------------------------
  // Validation & Exception Handling
  // -------------------------------------------------------

  private validateResponse<TResponse, TRequest>(
    response: ApiResponse<TResponse>,
    request: ApiRequest<TRequest>,
  ): void {
    const expectedStatus = request.expectedStatus;
    if (expectedStatus !== undefined) {
      if (response.status !== expectedStatus) {
        throw this.createException(
          response.status,
          `Expected HTTP ${expectedStatus} but received ${response.status}`,
        );
      }

      return;
    }
    if (response.ok) {
      return;
    }

    throw this.createException(
      response.status,
      `Request failed with HTTP ${response.status}`,
    );
  }
  private createException(status: number, message: string): ApiException {
    switch (status) {
      case 400:
        return new ValidationException(message);

      case 401:
      case 403:
        return new AuthenticationException(message);

      case 404:
        return new ResourceNotFoundException(message);

      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
        return new ServerException(status, message);

      default:
        return new ApiException(message, status);
    }
  }
  private handleException(error: unknown): never {
    if (error instanceof ApiException) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiException(error.message, 0);
    }

    throw new ApiException("Unknown API error occurred.", 0);
  }
}
