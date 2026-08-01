import { Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { OrdersPageLocators } from "../locators/OrdersPageLocators";
import { AppRoutes } from "../constants/AppRoutes";

export class OrdersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate(AppRoutes.ORDERS);
  }

  async isProductInOrders(productName: string): Promise<boolean> {
    const matchingRow = this.page
      .locator(OrdersPageLocators.orderRows)
      .filter({ has: this.page.locator(OrdersPageLocators.productNameCell, { hasText: productName }) });

    try {
      await matchingRow.first().waitFor({ state: "visible" });
      return true;
    } catch {
      return false;
    }
  }

  async getLatestOrderPrice(): Promise<string> {
    const latestRow = this.page.locator(OrdersPageLocators.orderRows).first();

    return (await latestRow.locator(OrdersPageLocators.priceCell).textContent())?.trim() ?? "";
  }
}
