import { createBdd } from "playwright-bdd";

import { test } from "../../../../fixtures/testFixture";
import { TestData } from "../../../../data";
import { UiData } from "../../../../data/models/UiData";
import { User } from "../../../../models/User";
import { LoginValidator } from "../../../../validators/LoginValidator";

const { Given, When, Then, BeforeAll } = createBdd(test);

let uiData: UiData;

// Tag-scoped so this hook — and the customTest it's bound to — only applies to @ui
// scenarios; an unscoped BeforeAll runs for every generated feature file regardless
// of tags, which confuses bddgen's per-feature test-instance guessing across layers.
BeforeAll({ tags: "@ui" }, async () => {
  uiData = await TestData.load<UiData>("uiData");
});

function resolveLoginUser(key: string): User {
  const loginUsers: Record<string, User> = {
    validUser: uiData.login.validUser,
    invalidPassword: uiData.login.invalidPassword,
    invalidEmail: uiData.login.invalidEmail,
  };

  return structuredClone(loginUsers[key]);
}

Given("I am on the login page", async ({ loginPage }) => {
  await loginPage.navigate();
});

When("I log in with the {string} credentials", async ({ loginPage }, userKey: string) => {
  await loginPage.login(resolveLoginUser(userKey));
});

Then("I should be redirected to the dashboard", async ({ loginPage }) => {
  await loginPage.waitForLoad();

  LoginValidator.expectLoginSuccess(await loginPage.currentUrl());
});

Then("a login error should be displayed", async ({ loginPage }) => {
  LoginValidator.expectLoginFailed(await loginPage.getErrorMessage());
});
