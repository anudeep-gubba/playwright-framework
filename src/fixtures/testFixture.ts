import { test as base, expect, request } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { RegistrationPage } from "../pages/RegistrationPage";

type FrameworkFixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  },
});

export { expect };
