import { test } from "../../src/fixtures/testFixture";
import { TestData } from "../../src/data";
import { UiData } from "../../src/data/models/UiData";
import { LoginValidator } from "../../src/validators/LoginValidator";

test.describe("Authentication :: Login", () => {
  let uiData: UiData;

  test.beforeAll(async () => {
    uiData = await TestData.load<UiData>("uiData");
  });

  test.describe("Positive Scenarios", () => {
    test("Valid user should login successfully @smoke", async ({ loginPage }) => {
      const user = structuredClone(uiData.login.validUser);

      await loginPage.navigate();

      await loginPage.login(user);

      await loginPage.waitForLoad();

      LoginValidator.expectLoginSuccess(await loginPage.currentUrl());
    });
  });

  test.describe("Negative Scenarios", () => {
    test("Invalid password should display login error @regression", async ({ loginPage }) => {
      const loginUser = structuredClone(uiData.login.invalidPassword);

      await loginPage.navigate();

      await loginPage.login(loginUser);

      LoginValidator.expectLoginFailed(await loginPage.getErrorMessage());
    });

    test("Invalid email should display login error @regression", async ({ loginPage }) => {
      const loginUser = structuredClone(uiData.login.invalidEmail);

      await loginPage.navigate();

      await loginPage.login(loginUser);

      LoginValidator.expectLoginFailed(await loginPage.getErrorMessage());
    });
  });
});
