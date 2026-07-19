import { Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { Button } from "../components";
import { TextBox } from "../components/form/TextBox";
import { CheckBox } from "../components/form/CheckBox";
import { RegistrationPageLocators } from "../locators/RegistrationPageLocators";
import { AppRoutes } from "../constants/AppRoutes";
import { RegistrationUser } from "../models/RegistrationUser";
import { AllureHelper } from "../reporting/AllureHelper";

export class RegistrationPage extends BasePage {
  private readonly firstName: TextBox;
  private readonly lastName: TextBox;
  private readonly email: TextBox;
  private readonly password: TextBox;
  private readonly confirmPassword: TextBox;
  private readonly createAccount: Button;
  private readonly ageCheckbox?: CheckBox;

  constructor(page: Page) {
    super(page);

    this.firstName = new TextBox(
      page.locator(RegistrationPageLocators.firstNameTextbox),
    );

    this.lastName = new TextBox(
      page.locator(RegistrationPageLocators.lastNameTextbox),
    );

    this.email = new TextBox(
      page.locator(RegistrationPageLocators.emailTextbox),
    );

    this.password = new TextBox(
      page.locator(RegistrationPageLocators.passwordTextbox),
    );

    this.confirmPassword = new TextBox(
      page.locator(RegistrationPageLocators.confirmPasswordTextbox),
    );

    this.createAccount = new Button(
      page.locator(RegistrationPageLocators.createAccountButton),
    );

    // Initialize if the page has a terms/age checkbox
    // this.ageCheckbox = new CheckBox(page.locator(RegistrationPageLocators.ageCheckbox));
  }

  async navigate(): Promise<void> {
    await super.navigate(AppRoutes.REGISTER);
  }

  async register(user: RegistrationUser): Promise<void> {
    await AllureHelper.step("Enter First Name", async () => {
      await this.firstName.enter(user.firstName);
    });

    await AllureHelper.step("Enter Last Name", async () => {
      await this.lastName.enter(user.lastName);
    });

    await AllureHelper.step("Enter Email", async () => {
      await this.email.enter(user.email);
    });

    await AllureHelper.step("Enter Password", async () => {
      await this.password.enter(user.password);
    });

    await AllureHelper.step("Confirm Password", async () => {
      await this.confirmPassword.enter(user.password);
    });

    // if (this.ageCheckbox) {
    //   await this.ageCheckbox.check();
    // }

    await AllureHelper.step("Click Create Account", async () => {
      await this.createAccount.click();
    });
  }
}
