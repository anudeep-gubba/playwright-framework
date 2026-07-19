import { TestInfo } from "@playwright/test";

export class AttachmentHelper {
  static async attachJson(
    testInfo: TestInfo,
    name: string,
    data: unknown,
  ): Promise<void> {
    await testInfo.attach(name, {
      body: JSON.stringify(data, null, 2),
      contentType: "application/json",
    });
  }

  static async attachText(
    testInfo: TestInfo,
    name: string,
    text: string,
  ): Promise<void> {
    await testInfo.attach(name, {
      body: text,
      contentType: "text/plain",
    });
  }
}
