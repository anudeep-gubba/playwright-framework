import { expect, Page } from "@playwright/test";

import { Logger } from "../utils/Logger";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async navigate(url: string): Promise<void> {
    Logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }

  async verifyUrl(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  async verifyTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  protected getPage(): Page {
    return this.page;
  }
}
