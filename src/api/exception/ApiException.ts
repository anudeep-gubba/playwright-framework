export class ApiException extends Error {
  public readonly status: number;
  public readonly response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);

    this.name = "ApiException";
    this.status = status;
    this.response = response;

    Object.setPrototypeOf(this, ApiException.prototype);
  }
}
