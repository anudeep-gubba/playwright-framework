import { expect, Locator } from "@playwright/test";

export abstract class BaseComponent {
  constructor(protected readonly locator: Locator) {}
  async isVisible(): Promise<void> {
    await expect(this.locator).toBeVisible();
  }
  async isHidden(): Promise<void> {
    await expect(this.locator).toBeHidden();
  }
  async isEnabled(): Promise<void> {
    await expect(this.locator).toBeEnabled();
  }
  async isDisabled(): Promise<void> {
    await expect(this.locator).toBeDisabled();
  }
  async scrollIntoView(): Promise<void> {
    await this.locator.scrollIntoViewIfNeeded();
  }
  locatorElement(): Locator {
    return this.locator;
  }
}
