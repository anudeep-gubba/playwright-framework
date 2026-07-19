import { Page } from "@playwright/test";

export class CommonActions {
  static async refresh(page: Page): Promise<void> {
    await page.reload();
  }

  static async goBack(page: Page): Promise<void> {
    await page.goBack();
  }

  static async goForward(page: Page): Promise<void> {
    await page.goForward();
  }
}
