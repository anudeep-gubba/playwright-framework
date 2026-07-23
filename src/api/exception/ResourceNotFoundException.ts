import { ApiException } from "./ApiException";

export class ResourceNotFoundException extends ApiException {
  constructor(message = "Requested resource was not found.", response?: unknown) {
    super(message, 404, response);

    this.name = "ResourceNotFoundException";

    Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
  }
}
