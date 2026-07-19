import { BaseComponent } from "../base/BaseComponent";

export class Label extends BaseComponent {
  async text(): Promise<string> {
    return (await this.locator.textContent()) ?? "";
  }
}
