import { test } from "../../src/fixtures/testFixture";
import { TestData } from "../../src/data";
import { UiData } from "../../src/data/models/UiData";
import { LoginValidator } from "../../src/validators/LoginValidator";

const uiData = TestData.load<UiData>("uiData");

test.describe("Authentication :: Login", () => {
  test.describe("Positive Scenarios", () => {
    test("Valid user should login successfully @smoke", async ({ loginPage }) => {
      const user = structuredClone(uiData.login.validUser);

      await loginPage.navigate();

      await loginPage.login(user);

      await loginPage.waitForLoad();

      LoginValidator.expectLoginSuccess(await loginPage.currentUrl());
    });
  });

  const negativeScenarios = [
    ["Invalid password", uiData.login.invalidPassword],
    ["Invalid email", uiData.login.invalidEmail],
  ] as const;
  for (const [name, user] of negativeScenarios) {
    test(`${name} should display login error`, async ({ loginPage }) => {
      const loginUser = structuredClone(user);

      await loginPage.navigate();

      await loginPage.login(loginUser);

      LoginValidator.expectLoginFailed(await loginPage.getErrorMessage());
    });
  }
});
