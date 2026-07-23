import { ApiException } from "./ApiException";

export class ServerException extends ApiException {
  constructor(
    status: number,
    message = "Server returned an unexpected error.",
    response?: unknown,
  ) {
    super(message, status, response);

    this.name = "ServerException";

    Object.setPrototypeOf(this, ServerException.prototype);
  }
}
