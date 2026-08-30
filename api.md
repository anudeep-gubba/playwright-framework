### Architecture diagram

```mermaid
flowchart TD
    A0[Feature File\n event.feature ] --> A[Step Definitions\n event.steps.ts ]
    A --> B[Playwright Fixture\n apiTest.ts ]
    B --> C[ApiFacade\n ApiFacade.ts ]

    C --> D[AuthService\n AuthenticationService.ts ]
    C --> E[EventService\n EventService.ts ]

    D --> G[ApiEngine\n ApiEngine.ts ]
    E --> G

    G --> H[Header Builder\n ApiEngine.ts ]
    G --> I[Retry Executor\n RetryPolicy.ts ]
    G --> J[Response Validator\n ApiEngine.ts ]

    G --> K[Logger\n Logger utility ]
    G --> L[Request/Response Attachments\n RequestResponseAttachment.ts ]
    G --> M[APIRequestContext\n Playwright request context ]

    M --> N[Playwright / Backend API]
```

### What each file is used for

- `features/api/event.feature`  
  Gherkin scenario that describes the API workflow: login, create, update, delete — one `Given`/`When`/`Then` line per step.

- `src/bdd/steps/api/event.steps.ts`  
  Step definitions implementing the feature file, built with `createBdd(test)` from `playwright-bdd`; `playwright-bdd`'s `bddgen` generates the actual Playwright test from this + the feature file into `.features-gen/api/event.feature.spec.js` (gitignored).

- `src/api/fixtures/apiTest.ts`  
  Custom Playwright fixture (extended from `playwright-bdd`'s `test`, not `@playwright/test`'s directly) that injects the `api` object into the test context, plus the shared lifecycle-logging auto-fixture.

- `src/api/fixtures/apiFixture.ts`  
  Creates the request context, token manager, engine, and facade for every API test.

- `src/api/ApiFacade.ts`  
  Main entry point that exposes services and scenario context to the test.

- `src/api/services/index.ts`  
  Registers the available services (`auth`, `event`) into a service map.

- `src/api/services/AuthenticationService.ts`  
  Handles login/logout and token-related behavior.

- `src/api/services/EventService.ts`  
  Wraps event create/update/delete operations.

- `src/api/client/ApiEngine.ts`  
  Actual HTTP execution engine. Builds URLs, headers, and performs the request.

- `src/api/client/RetryPolicy.ts`  
  Retry logic used when API calls need another attempt.

- `src/api/context/ApiScenarioContext.ts`  
  Stores temporary values such as token and event ID across steps in the same test.

- `src/api/auth/TokenManager.ts`  
  Stores and retrieves the auth token for secure requests.

- `src/api/requests/*.ts`  
  Defines the exact request payload shape for login and events.

- `src/api/responses/*.ts`  
  Defines the response structure expected from the backend so the test can assert on it properly.

- `src/api/types/*.ts`  
  Shared reusable request/response types used throughout the API layer.

- `src/api/exception/*.ts`  
  Custom exception classes for `400`, `401`, `404`, and `5xx` API failures.

- `src/api/index.ts`  
  Barrel export file that re-exports the API layer for easier importing.

---
