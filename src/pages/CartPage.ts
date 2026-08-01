import { Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { Button } from "../components";
import { CartPageLocators } from "../locators/CartPageLocators";
import { AllureHelper } from "../reporting/AllureHelper";

export class CartPage extends BasePage {
  private readonly checkoutButton: Button;

  constructor(page: Page) {
    super(page);

    this.checkoutButton = new Button(
      page.locator(CartPageLocators.checkoutButton, { hasText: "Checkout" }),
    );
  }

  async checkout(): Promise<void> {
    await AllureHelper.step("Proceed to checkout", async () => {
      await this.checkoutButton.click();
    });
  }
}
