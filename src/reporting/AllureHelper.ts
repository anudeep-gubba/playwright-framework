import * as allure from "allure-js-commons";

export class AllureHelper {
  static async step<T>(stepName: string, action: () => Promise<T>): Promise<T> {
    return allure.step(stepName, action);
  }

  static description(description: string): void {
    allure.description(description);
  }

  static severity(
    level: "blocker" | "critical" | "normal" | "minor" | "trivial",
  ): void {
    allure.severity(level);
  }

  static owner(owner: string): void {
    allure.owner(owner);
  }

  static tag(...tags: string[]): void {
    allure.tags(...tags);
  }
}
