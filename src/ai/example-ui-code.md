# UI Consumer Example Guide

Use this file as the project-aligned reference contract for new UI flows in this repository.

The examples below are based on the current code already present in the workspace, not on a synthetic template.

## 1. `features/ui/authentication/`

File: `login.feature`
Purpose: describe the current login flow in Gherkin — one scenario per distinct behavior, tagged for grouping and `--grep` filtering. Use `Scenario Outline` + `Examples` (not repeated near-duplicate `Scenario`s) whenever multiple scenarios only differ by one data value, like the two negative-credential cases here; naming the outline itself with the column placeholder (`Invalid <credentialKey> should...`) gives each generated example a readable title instead of the default `Example #1`/`Example #2`.

```gherkin
@ui
Feature: Login
  As a registered user
  I want to log in with my credentials
  So that I can access my dashboard

  Background:
    Given I am on the login page

  @smoke
  Scenario: Valid user should login successfully
    When I log in with the "validUser" credentials
    Then I should be redirected to the dashboard

  @regression @negative
  Scenario Outline: Invalid <credentialKey> should display a login error
    When I log in with the "<credentialKey>" credentials
    Then a login error should be displayed

    Examples:
      | credentialKey   |
      | invalidPassword |
      | invalidEmail    |
```

## 2. `src/bdd/steps/ui/authentication/`

File: `login.steps.ts`
Purpose: implement the Gherkin steps against the shared fixture and page object, resolving named credential keys from the loaded dataset rather than accepting literal values from step text.

```typescript
import { createBdd } from "playwright-bdd";

import { test } from "../../../../fixtures/testFixture";
import { TestData } from "../../../../data";
import { AuthenticationData } from "../../../../data/models/AuthenticationData";
import { User } from "../../../../models/User";
import { LoginValidator } from "../../../../validators/LoginValidator";

const { Given, When, Then, BeforeAll } = createBdd(test);

let authentication: AuthenticationData;

// Tag-scoped: an unscoped BeforeAll is global across every generated feature file
// (including the API layer's), which breaks bddgen's per-feature fixture guessing.
BeforeAll({ tags: "@ui" }, async () => {
  authentication = await TestData.load<AuthenticationData>("authentication");
});

function resolveLoginUser(key: string): User {
  const loginUsers: Record<string, User> = {
    validUser: authentication.login.validUser,
    invalidPassword: authentication.login.invalidPassword,
    invalidEmail: authentication.login.invalidEmail,
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
```

## 3. `src/pages/`

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

## 4. `src/components/`

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

## 5. `src/locators/`

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

## 6. `src/fixtures/`

File: `testFixture.ts`
Purpose: provide the standard reusable fixtures for UI scenarios, extended from `playwright-bdd`'s `test` (not `@playwright/test`'s directly) so `createBdd(test)` works in step files, plus the shared lifecycle-logging auto-fixture.

```typescript
import { expect } from "@playwright/test";
import { test as base } from "playwright-bdd";

import { LoginPage } from "../pages/LoginPage";
import { lifecycleLoggingFixture, LifecycleLoggingFixtures } from "../hooks/testHook";

type FrameworkFixtures = {
  loginPage: LoginPage;
} & LifecycleLoggingFixtures;

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  ...lifecycleLoggingFixture,
});

export { expect };
```

## 7. `src/validators/`

File: `LoginValidator.ts`
Purpose: validate UI outcomes with readable assertions, called from `Then` steps.

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

## 8. `src/models/`

File: `User.ts`
Purpose: define the request payload shape used by the login page object.

```typescript
export interface User {
  email: string;
  password: string;
}
```

## 9. `src/constants/`

File: `AppRoutes.ts`
Purpose: centralize navigation routes used by page classes.

```typescript
export const AppRoutes = Object.freeze({
  LOGIN: "/client/#/auth/login",
});
```

## 10. `src/data/models/`

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

## 11. `src/data/datasets/json/`

File: `authentication.json`
Purpose: keep static UI credentials separated from test code. `validUser` holds a real, working
account, so its email/password are `{{key}}` placeholders resolved via `resolveSecrets()`
(`src/data/utils/resolveSecrets.ts`) against `config/secrets/<env>.env` — never commit the real
values, and never inline them (or the deliberately-wrong ones below) as literal step text in a
`.feature` file. `invalidPassword`/`invalidEmail` are deliberately-wrong values that never
authenticate anything, so they're plain data, not secrets.

```json
{
  "login": {
    "validUser": {
      "email": "{{uiValidUserEmail}}",
      "password": "{{uiValidUserPassword}}"
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

## 12. `src/data/datasets/yaml/`

File: `authentication.yaml`
Purpose: provide the same dataset in YAML format for easier review. Quote `{{...}}` placeholders —
unquoted, `{` starts YAML flow-mapping syntax.

```yaml
login:
  validUser:
    email: "{{uiValidUserEmail}}"
    password: "{{uiValidUserPassword}}"

  invalidPassword:
    email: valid@test.com
    password: WrongPassword

  invalidEmail:
    email: invalid@test.com
    password: Password123
```

### CSV and Excel formats (`src/data/datasets/csv/`, `src/data/datasets/excel/`)

File: `authentication.csv` (and the equivalent `authentication.xlsx` sheet with the same header/rows)
Purpose: same dataset as above, expressed as flat `key,value,type` rows instead of nested JSON/YAML — `key` is a dot-path into the object, `type` is optional (`string` default, `number`, `boolean`).

```csv
key,value,type
login.validUser.email,{{uiValidUserEmail}},string
login.validUser.password,{{uiValidUserPassword}},string
login.invalidPassword.email,valid@test.com,string
login.invalidPassword.password,WrongPassword,string
login.invalidEmail.email,invalid@test.com,string
login.invalidEmail.password,Password123,string
```

`CsvProvider`/`ExcelProvider` rebuild this into the identical nested object via `unflattenRows` (`src/data/utils/tabularData.ts`), so `AuthenticationData` and the steps above work unchanged regardless of `TEST_DATA_FORMAT`.

## What a consumer should add

When using this framework for a new application, keep the same folder contract and replace only the application-specific UI behavior.

- Add page objects in `src/pages/`
- Add reusable controls in `src/components/`
- Add selector constants in `src/locators/`
- Add fixture support in `src/fixtures/`
- Add result validators in `src/validators/`
- Add test data models in `src/data/models/`
- Add dataset files for every supported format (JSON, YAML, CSV, Excel) in `src/data/datasets/`
- Add UI scenarios under `features/ui/<feature>/*.feature` and their step definitions under `src/bdd/steps/ui/<feature>/*.steps.ts`
- Run `npm run bddgen` to regenerate `.features-gen/` after adding or changing a `.feature` file or step definitions
