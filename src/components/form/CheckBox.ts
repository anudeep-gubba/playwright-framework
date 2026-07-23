import { BaseComponent } from "../base/BaseComponent";

export class CheckBox extends BaseComponent {
  async check(): Promise<void> {
    await this.locator.check();
  }
  async uncheck(): Promise<void> {
    await this.locator.uncheck();
  }
  async toggle(): Promise<void> {
    if (await this.locator.isChecked()) {
      await this.uncheck();
    } else {
      await this.check();
    }
  }
  async isChecked(): Promise<boolean> {
    return await this.locator.isChecked();
  }
}
