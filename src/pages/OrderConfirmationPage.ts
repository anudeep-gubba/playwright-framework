import { Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { Button, Label } from "../components";
import { OrderConfirmationPageLocators } from "../locators/OrderConfirmationPageLocators";
import { AllureHelper } from "../reporting/AllureHelper";

export class OrderConfirmationPage extends BasePage {
  private readonly confirmationHeading: Label;
  private readonly ordersHistoryLink: Button;

  constructor(page: Page) {
    super(page);

    this.confirmationHeading = new Label(
      page.locator(OrderConfirmationPageLocators.confirmationHeading),
    );
    this.ordersHistoryLink = new Button(
      page.locator(OrderConfirmationPageLocators.ordersHistoryLink),
    );
  }

  async getConfirmationMessage(): Promise<string> {
    return (await this.confirmationHeading.text()).trim();
  }

  async goToOrders(): Promise<void> {
    await AllureHelper.step("Go to orders history", async () => {
      await this.ordersHistoryLink.click();
    });
  }
}
