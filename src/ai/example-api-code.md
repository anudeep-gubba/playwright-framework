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

## 7. `tests/api/`

File: `authentication.spec.ts`
Purpose: validate the API flow with the service layer instead of raw request calls.

```typescript
import { test, expect } from "../../src/api/fixtures/apiTest";
import { TestData } from "../../src/data";
import { AuthenticationData } from "../../src/data/models/AuthenticationData";

test.describe("API :: Authentication", () => {
  let authentication: AuthenticationData;

  test.beforeAll(async () => {
    authentication = await TestData.load<AuthenticationData>("authentication");
  });

  test("Login API should return success and token", async ({ api }) => {
    const user = authentication.apiLogin.validUser;

    const response = await api.service("auth").login({
      email: user.email,
      password: user.password,
    });

    expect(response.success).toBe(true);
    expect(response.token).toBeTruthy();
    expect(response.user.email).toBe(user.email);
  });

  test("Create event API should use login token and return created event", async ({
    api,
  }) => {
    const eventRequest = {
      ...authentication.apiEvent.createEvent,
    };

    const loginResponse = await api.service("auth").login({
      email: authentication.apiLogin.validUser.email,
      password: authentication.apiLogin.validUser.password,
    });

    api.setContextValue("authToken", loginResponse.token);

    const eventResponse = await api.service("event").createEvent(eventRequest);

    expect(eventResponse.success).toBe(true);
    expect(eventResponse.data.id).toBeGreaterThan(0);
  });
});
```

## What a consumer should add

When adopting this framework for a new application, the consumer should create the same folder/file pattern and replace only the endpoint-specific logic and payload shapes.

- Add request interfaces in `src/api/requests/`
- Add response interfaces in `src/api/responses/`
- Add endpoint constants in `src/constants/APIEndpoints.ts`
- Add endpoint wrappers in `src/api/services/`
- Add dataset files for every supported format (JSON, YAML, CSV, Excel) in `src/data/datasets/`
- Add API scenario tests in `tests/api/`
- Keep the folder contract stable even when the target application changes
