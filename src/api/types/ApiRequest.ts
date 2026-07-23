import { ApiHeaders } from "./ApiHeaders";
import { ApiQueryParams } from "./ApiQueryParams";
import { HttpMethod } from "./HttpMethod";

export interface ApiRequest<TBody = unknown> {
  method: HttpMethod;

  endpoint: string;

  body?: TBody;

  headers?: ApiHeaders;

  queryParams?: ApiQueryParams;

  timeout?: number;

  retries?: number;

  expectedStatus?: number;
}
