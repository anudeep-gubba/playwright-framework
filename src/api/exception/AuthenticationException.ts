import { ApiException } from "./ApiException";

export class AuthenticationException extends ApiException {
  constructor(
    message = "Authentication failed. Please verify your credentials or access token.",
    response?: unknown,
  ) {
    super(message, 401, response);

    this.name = "AuthenticationException";

    Object.setPrototypeOf(this, AuthenticationException.prototype);
  }
}
