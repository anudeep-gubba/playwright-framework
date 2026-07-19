import { TestInfo } from "@playwright/test";

export class RequestResponseAttachment {
  static async attachRequest(testInfo: TestInfo, body: unknown): Promise<void> {
    await testInfo.attach("API Request", {
      body: JSON.stringify(body, null, 2),
      contentType: "application/json",
    });
  }

  static async attachResponse(
    testInfo: TestInfo,
    body: unknown,
  ): Promise<void> {
    await testInfo.attach("API Response", {
      body: JSON.stringify(body, null, 2),
      contentType: "application/json",
    });
  }

  static async attachHeaders(
    testInfo: TestInfo,
    headers: unknown,
  ): Promise<void> {
    await testInfo.attach("HTTP Headers", {
      body: JSON.stringify(headers, null, 2),
      contentType: "application/json",
    });
  }
}
