import { Locator, Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { Button, TextBox } from "../components";
import { CheckoutPageLocators } from "../locators/CheckoutPageLocators";
import { PaymentDetails } from "../models/PaymentDetails";
import { AllureHelper } from "../reporting/AllureHelper";

export class CheckoutPage extends BasePage {
  private readonly paymentFields: Locator;
  private readonly countryInput: TextBox;
  private readonly placeOrderButton: Button;

  constructor(page: Page) {
    super(page);

    this.paymentFields = page.locator(CheckoutPageLocators.paymentFieldInputs);
    this.countryInput = new TextBox(page.locator(CheckoutPageLocators.countryInput));
    this.placeOrderButton = new Button(page.locator(CheckoutPageLocators.placeOrderButton));
  }

  async enterPaymentDetails(payment: PaymentDetails): Promise<void> {
    await AllureHelper.step("Enter CVV", async () => {
      await this.paymentFields.nth(1).fill(payment.cvv);
    });

    await AllureHelper.step("Enter name on card", async () => {
      await this.paymentFields.nth(2).fill(payment.nameOnCard);
    });
  }

  async selectCountry(country: string): Promise<void> {
    await AllureHelper.step(`Select country: ${country}`, async () => {
      const countryField = this.countryInput.locatorElement();
      const escapedCountry = country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const exactCountryPattern = new RegExp(`^\\s*${escapedCountry}\\s*$`);

      await countryField.click();
      await countryField.pressSequentially(country);

      await this.page
        .locator(CheckoutPageLocators.countryResultsContainer)
        .locator(CheckoutPageLocators.countryResultItem)
        .filter({ hasText: exactCountryPattern })
        .click();
    });
  }

  async placeOrder(): Promise<void> {
    await AllureHelper.step("Place order", async () => {
      await this.placeOrderButton.click();
    });
  }
}
