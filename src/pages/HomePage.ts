import { Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { Button, TextBox } from "../components";
import { HomePageLocators } from "../locators/HomePageLocators";
import { AppRoutes } from "../constants/AppRoutes";
import { AllureHelper } from "../reporting/AllureHelper";

export class HomePage extends BasePage {
  private readonly searchBox: TextBox;
  private readonly cartNavButton: Button;
  private readonly ordersNavButton: Button;

  constructor(page: Page) {
    super(page);

    this.searchBox = new TextBox(page.locator(HomePageLocators.searchInput));
    this.cartNavButton = new Button(page.locator(HomePageLocators.cartNavButton));
    this.ordersNavButton = new Button(page.locator(HomePageLocators.ordersNavButton));
  }

  async navigate(): Promise<void> {
    await super.navigate(AppRoutes.DASHBOARD);
  }

  async searchProduct(productName: string): Promise<void> {
    await AllureHelper.step(`Search product: ${productName}`, async () => {
      await this.searchBox.enter(productName);
    });
  }

  async addProductToCart(productName: string): Promise<void> {
    await AllureHelper.step(`Add product to cart: ${productName}`, async () => {
      const card = this.page
        .locator(HomePageLocators.productCard)
        .filter({
          has: this.page.locator(HomePageLocators.productName, { hasText: productName }),
        })
        .first();

      await card.getByText("Add To Cart").click();
    });
  }

  async goToCart(): Promise<void> {
    await AllureHelper.step("Go to cart", async () => {
      await this.cartNavButton.click();
    });
  }

  async goToOrders(): Promise<void> {
    await AllureHelper.step("Go to orders", async () => {
      await this.ordersNavButton.click();
    });
  }
}
