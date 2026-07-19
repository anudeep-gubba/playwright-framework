import { expect } from "@playwright/test";
import { Messages } from "../constants";

export class LoginValidator {
  static expectLoginFailed(message: string): void {
    expect(message).toContain(Messages.LOGIN_FAILURE);
  }

  static expectLoginSuccess(currentUrl: string): void {
    expect(currentUrl).toContain("/dashboard/dash");
  }
}
