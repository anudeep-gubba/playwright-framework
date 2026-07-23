import { ApiHeaders } from "./ApiHeaders";

export interface ApiResponse<TBody = unknown> {
  status: number;

  ok: boolean;

  headers: ApiHeaders;

  duration: number;

  body: TBody;
}
