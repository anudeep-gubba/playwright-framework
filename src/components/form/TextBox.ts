import { BaseComponent } from "../base/BaseComponent";

export class TextBox extends BaseComponent {
  async enter(text: string): Promise<void> {
    await this.locator.fill(text);
  }

  async append(text: string): Promise<void> {
    await this.locator.pressSequentially(text);
  }

  async clear(): Promise<void> {
    await this.locator.clear();
  }

  async value(): Promise<string> {
    return await this.locator.inputValue();
  }
}
