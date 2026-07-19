import { expect } from "@playwright/test";
import { Messages } from "../constants";

export class RegistrationValidator {
  static expectRegistrationSuccess(message: string): void {
    expect(message).toContain(Messages.ACCOUNT_CREATION_SUCCESS);
  }

  static expectEmailRequired(message: string): void {
    expect(message).toContain("Email is required");
  }

  static expectFirstNameRequired(message: string): void {
    expect(message).toContain("First name is required");
  }

  static expectLastNameRequired(message: string): void {
    expect(message).toContain("Last name is required");
  }

  static expectPasswordRequired(message: string): void {
    expect(message).toContain("Password is required");
  }
}
