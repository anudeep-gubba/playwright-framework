import { expect } from "@playwright/test";
import { Messages } from "../constants";

export class CheckoutValidator {
  static expectOrderConfirmed(message: string): void {
    expect(message).toContain(Messages.ORDER_CONFIRMATION_SUCCESS);
  }

  static expectOrderInHistory(isPresent: boolean): void {
    expect(isPresent).toBe(true);
  }
}
