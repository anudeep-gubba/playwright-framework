import { BaseComponent } from "./base/BaseComponent";

export class Button extends BaseComponent {
  async click(): Promise<void> {
    await this.locator.click();
  }
  async doubleClick(): Promise<void> {
    await this.locator.dblclick();
  }
  async rightClick(): Promise<void> {
    await this.locator.click({
      button: "right",
    });
  }
}
