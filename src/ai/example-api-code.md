# API Consumer Example Guide

Use this single file as the reference contract when reusing the framework for a new application.

## 1. `src/api/requests/`

File: `LoginRequest.ts`
Purpose: define the payload contract for login API requests.

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}
```

## 2. `src/api/responses/`

File: `LoginResponse.ts`
Purpose: define the response shape returned from the login endpoint.

```typescript
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
  };
}
```

## 3. `src/constants/`

File: `APIEndpoints.ts`
Purpose: keep all API paths centralized and stable for the target application.

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
  },
  EVENT: {
    CREATE: "/api/events",
    LIST: "/api/events",
  },
};
```

## 4. `src/api/services/`

File: `AuthenticationService.ts`
Purpose: expose endpoint behavior through a reusable service class.

```typescript
import { BaseService } from "./BaseService";
import { ApiEngine } from "../client/ApiEngine";
import { TokenManager } from "../auth/TokenManager";
import { LoginRequest } from "../requests/LoginRequest";
import { LoginResponse } from "../responses/LoginResponse";
import { HttpMethod } from "../types/HttpMethod";
import { API_ENDPOINTS } from "../../constants/APIEndpoints";

export class AuthenticationService extends BaseService {
  constructor(
    api: ApiEngine,
    private readonly tokenManager: TokenManager,
  ) {
    super(api);
  }

  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.execute<LoginResponse, LoginRequest>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.AUTH.LOGIN,
      body: credentials,
    });

    this.tokenManager.setToken(response.body.token);
    return response.body;
  }

  public logout(): void {
    this.tokenManager.clear();
  }
}
```

## 5. `src/data/datasets/json/`

File: `authentication.json`
Purpose: store static payloads used by API scenarios. `validUser` is a real, working account, so
its email/password are `{{key}}` placeholders resolved via `resolveSecrets()`
(`src/data/utils/resolveSecrets.ts`) against `config/secrets/<env>.env` — never commit the real
values.

```json
{
  "apiLogin": {
    "validUser": {
      "email": "{{apiValidUserEmail}}",
      "password": "{{apiValidUserPassword}}"
    }
  },
  "apiEvent": {
    "createEvent": {
      "title": "Launch Event",
      "city": "Hyderabad",
      "price": 499
    }
  }
}
```

## 6. `src/data/datasets/yaml/`

File: `authentication.yaml`
Purpose: alternate dataset format when YAML is preferred for readability. Quote `{{...}}`
placeholders — unquoted, `{` starts YAML flow-mapping syntax.

```yaml
apiLogin:
  validUser:
    email: "{{apiValidUserEmail}}"
    password: "{{apiValidUserPassword}}"

apiEvent:
  createEvent:
    title: Launch Event
    city: Hyderabad
    price: 499
```

### CSV and Excel formats (`src/data/datasets/csv/`, `src/data/datasets/excel/`)

File: `authentication.csv` (and the equivalent `authentication.xlsx` sheet with the same header/rows)
Purpose: same dataset as above, expressed as flat `key,value,type` rows instead of nested JSON/YAML — `key` is a dot-path into the object, `type` is optional (`string` default, `number`, `boolean`) and must be set explicitly for non-string fields like `price`.

```csv
key,value,type
apiLogin.validUser.email,{{apiValidUserEmail}},string
apiLogin.validUser.password,{{apiValidUserPassword}},string
apiEvent.createEvent.title,Launch Event,string
apiEvent.createEvent.city,Hyderabad,string
apiEvent.createEvent.price,499,number
```

`CsvProvider`/`ExcelProvider` rebuild this into the identical nested object via `unflattenRows` (`src/data/utils/tabularData.ts`), so the test below works unchanged regardless of `TEST_DATA_FORMAT`.

## 7. `features/api/`

File: `authentication.feature`
Purpose: describe the API flow in Gherkin — one scenario for login, one for the login-then-create-event flow.

```gherkin
@api
Feature: Authentication
  As an authenticated API client
  I want to log in and create resources
  So that event management works end-to-end

  @smoke
  Scenario: Login API should return success and token
    When I log in via the API with valid credentials
    Then the login should succeed and return an auth token

  @regression
  Scenario: Create event API should use login token and return created event
    Given I log in via the API with valid credentials
    When I create an event
    Then the event should be created successfully
```

## 8. `src/bdd/steps/api/`

File: `authentication.steps.ts`
Purpose: implement the Gherkin steps with the service layer instead of raw request calls, carrying values between steps via `api.setContextValue()`/`api.getContextValue()`.

```typescript
import { createBdd } from "playwright-bdd";

import { test, expect } from "../../../api/fixtures/apiTest";
import { TestData } from "../../../data";
import { AuthenticationData } from "../../../data/models/AuthenticationData";
import { LoginResponse } from "../../../api/responses/LoginResponse";

const { Given, When, Then, BeforeAll } = createBdd(test);

let authentication: AuthenticationData;

// Tag-scoped: an unscoped BeforeAll is global across every generated feature file
// (including the UI layer's), which breaks bddgen's per-feature fixture guessing.
BeforeAll({ tags: "@api" }, async () => {
  authentication = await TestData.load<AuthenticationData>("authentication");
});

Given("I log in via the API with valid credentials", async ({ api }) => {
  const user = authentication.apiLogin.validUser;

  const loginResponse = await api.service("auth").login({
    email: user.email,
    password: user.password,
  });

  api.setContextValue("loginResponse", loginResponse);
});

Then("the login should succeed and return an auth token", async ({ api }) => {
  const loginResponse = api.getContextValue<LoginResponse>("loginResponse");

  expect(loginResponse.success).toBe(true);
  expect(loginResponse.token).toBeTruthy();

  api.setContextValue("authToken", loginResponse.token);
});

When("I create an event", async ({ api }) => {
  const eventRequest = { ...authentication.apiEvent.createEvent };

  const eventResponse = await api.service("event").createEvent(eventRequest);

  api.setContextValue("eventResponse", eventResponse);
});

Then("the event should be created successfully", async ({ api }) => {
  const eventResponse = api.getContextValue<{ success: boolean; data: { id: number } }>(
    "eventResponse",
  );

  expect(eventResponse.success).toBe(true);
  expect(eventResponse.data.id).toBeGreaterThan(0);
});
```

## What a consumer should add

When adopting this framework for a new application, the consumer should create the same folder/file pattern and replace only the endpoint-specific logic and payload shapes.

- Add request interfaces in `src/api/requests/`
- Add response interfaces in `src/api/responses/`
- Add endpoint constants in `src/constants/APIEndpoints.ts`
- Add endpoint wrappers in `src/api/services/`
- Add dataset files for every supported format (JSON, YAML, CSV, Excel) in `src/data/datasets/`
- Add API scenarios under `features/api/*.feature` and their step definitions under `src/bdd/steps/api/*.steps.ts`
- Run `npm run bddgen` to regenerate `.features-gen/` after adding or changing a `.feature` file or step definitions
- Keep the folder contract stable even when the target application changes
