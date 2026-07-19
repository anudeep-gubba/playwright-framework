import { Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { Button, Label, TextBox } from "../components";
import { LoginPageLocators } from "../locators/LoginPageLocators";
import { AppRoutes } from "../constants/AppRoutes";
import { User } from "../models/User";
import { AllureHelper } from "../reporting/AllureHelper";

export class LoginPage extends BasePage {
  private readonly email: TextBox;
  private readonly password: TextBox;
  private readonly loginButton: Button;
  private readonly errorMessage: Label;

  constructor(page: Page) {
    super(page);

    this.email = new TextBox(page.locator(LoginPageLocators.email));

    this.password = new TextBox(page.locator(LoginPageLocators.password));

    this.loginButton = new Button(page.locator(LoginPageLocators.loginButton));

    this.errorMessage = new Label(
      page.locator(LoginPageLocators.loginErrorMessage),
    );
  }

  async navigate(): Promise<void> {
    await super.navigate(AppRoutes.LOGIN);
  }

  async login(user: User): Promise<void> {
    await AllureHelper.step("Enter Email", async () => {
      await this.email.enter(user.email);
    });

    await AllureHelper.step("Enter Password", async () => {
      await this.password.enter(user.password);
    });

    await AllureHelper.step("Click Login", async () => {
      await this.loginButton.click();
    });
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.text();
  }
}
