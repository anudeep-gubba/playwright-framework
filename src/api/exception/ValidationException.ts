import { ApiException } from "./ApiException";

export class ValidationException extends ApiException {
  constructor(message = "Request validation failed.", response?: unknown) {
    super(message, 400, response);

    this.name = "ValidationException";

    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}
