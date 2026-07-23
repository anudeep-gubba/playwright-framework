import { test } from "../../src/fixtures/testFixture";
import { TestData } from "../../src/data";
import { AuthenticationData } from "../../src/data/models/AuthenticationData";
import { LoginValidator } from "../../src/validators/LoginValidator";

const authentication = TestData.load<AuthenticationData>("authentication");

test.describe("Authentication :: Login", () => {
  test.describe("Positive Scenarios", () => {
    test("Valid user should login successfully", async ({ loginPage }) => {
      const user = structuredClone(authentication.login.validUser);

      await loginPage.navigate();

      await loginPage.login(user);

      await loginPage.waitForLoad();

      LoginValidator.expectLoginSuccess(await loginPage.currentUrl());
    });
  });

  const negativeScenarios = [
    ["Invalid password", authentication.login.invalidPassword],
    ["Invalid email", authentication.login.invalidEmail],
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
