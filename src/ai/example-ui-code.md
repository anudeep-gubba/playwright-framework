# UI Consumer Example Guide

Use this file as the project-aligned reference contract for new UI flows in this repository.

The examples below are based on the current code already present in the workspace, not on a synthetic template.

## 1. `tests/authentication/`

File: `login.spec.ts`
Purpose: exercise the current login flow using the shared fixture and page object model.

```typescript
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
```

## 2. `src/pages/`

File: `LoginPage.ts`
Purpose: keep page interactions and navigational actions in one place.

```typescript
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
```

## 3. `src/components/`

File: `TextBox.ts`
Purpose: wrap reusable input behavior such as typing, clearing, and reading values.

```typescript
import { BaseComponent } from "../base/BaseComponent";

export class TextBox extends BaseComponent {
  async enter(text: string): Promise<void> {
    await this.locator.fill(text);
  }

  async append(text: string): Promise<void> {
    await this.locator.pressSequentially(text);
  }

  async clear(): Promise<void> {
    await this.locator.clear();
  }

  async value(): Promise<string> {
    return await this.locator.inputValue();
  }
}
```

File: `Button.ts`
Purpose: expose common button interactions through a reusable component wrapper.

```typescript
import { BaseComponent } from "./base/BaseComponent";

export class Button extends BaseComponent {
  async click(): Promise<void> {
    await this.locator.click();
  }

  async doubleClick(): Promise<void> {
    await this.locator.dblclick();
  }

  async rightClick(): Promise<void> {
    await this.locator.click({
      button: "right",
    });
  }
}
```

## 4. `src/locators/`

File: `LoginPageLocators.ts`
Purpose: keep selectors stable and separate from page behavior.

```typescript
export class LoginPageLocators {
  static readonly email = "#userEmail";
  static readonly password = "#userPassword";
  static readonly loginButton = "#login";
  static readonly loginErrorMessage = "[class*='toast-message']";
}
```

## 5. `src/fixtures/`

File: `testFixture.ts`
Purpose: provide the standard reusable fixtures for UI tests.

```typescript
import { test as base, expect } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";

type FrameworkFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
```

## 6. `src/validators/`

File: `LoginValidator.ts`
Purpose: validate UI outcomes with readable assertions.

```typescript
import { expect } from "@playwright/test";
import { Messages } from "../constants";

export class LoginValidator {
  static expectLoginFailed(message: string): void {
    expect(message).toContain(Messages.LOGIN_FAILURE);
  }

  static expectLoginSuccess(currentUrl: string): void {
    expect(currentUrl).toContain("/dashboard/dash");
  }
}
```

## 7. `src/models/`

File: `User.ts`
Purpose: define the request payload shape used by the login page object.

```typescript
export interface User {
  email: string;
  password: string;
}
```

## 8. `src/constants/`

File: `AppRoutes.ts`
Purpose: centralize navigation routes used by page classes.

```typescript
export const AppRoutes = Object.freeze({
  LOGIN: "/client/#/auth/login",
});
```

## 9. `src/data/models/`

File: `AuthenticationData.ts`
Purpose: describe the structure of the dataset used by login and registration scenarios.

```typescript
import { User } from "../../models";

export interface AuthenticationData {
  login: {
    validUser: User;
    invalidPassword: User;
    invalidEmail: User;
    emptyEmail: User;
    emptyPassword: User;
  };

  apiLogin: {
    validUser: User;
  };
  
}
```

## 10. `src/data/datasets/json/`

File: `authentication.json`
Purpose: keep static UI credentials separated from test code.

```json
{
  "login": {
    "validUser": {
      "email": "testaccountag@gmail.com",
      "password": "Test@1234"
    },
    "invalidPassword": {
      "email": "valid@test.com",
      "password": "WrongPassword"
    },
    "invalidEmail": {
      "email": "invalid@test.com",
      "password": "Password123"
    }
  }
}
```

## 11. `src/data/datasets/yaml/`

File: `authentication.yaml`
Purpose: provide the same dataset in YAML format for easier review.

```yaml
login:
  validUser:
    email: testaccountag@gmail.com
    password: Test@1234

  invalidPassword:
    email: valid@test.com
    password: WrongPassword

  invalidEmail:
    email: invalid@test.com
    password: Password123
```

## What a consumer should add

When using this framework for a new application, keep the same folder contract and replace only the application-specific UI behavior.

- Add page objects in `src/pages/`
- Add reusable controls in `src/components/`
- Add selector constants in `src/locators/`
- Add fixture support in `src/fixtures/`
- Add result validators in `src/validators/`
- Add test data models in `src/data/models/`
- Add dataset JSON/YAML files in `src/data/datasets/`
- Add UI scenario tests under the current test naming convention in `tests/`
