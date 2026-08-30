# Playwright Framework

A hybrid Playwright automation framework that supports separate UI and API test flows, reusable page objects/components, centralized test data, and structured reporting.

## Key Advantages

- Separate UI and API test layers for maintainability
- Reusable page objects and component wrappers
- Service-based API layer with token management
- Centralized test data with JSON/YAML/CSV/Excel support
- Built-in Playwright reports, Allure integration, and logging
- Easy extension for new flows with minimal file changes

## Prerequisites

- Node.js 18+ installed
- npm available
- Git if cloning repository
- Access to the target test environment if running against remote URLs

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd playwright-framework
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `config/environments/*.env`.
   - `BASE_URL` for UI tests
   - `API_BASE_URL` for API tests
   - `TEST_DATA_FORMAT` set to `json`, `yaml`, `csv`, or `excel`

4. Copy the secrets template for your environment and fill in real credential values (gitignored,
   never committed): `cp config/secrets/qa.env.example config/secrets/qa.env`. See
   [Secrets in test data](#secrets-in-test-data) below.

## Project Structure

```text
.
├── config/
│   ├── envLoader.ts         # Loads environment settings
│   ├── global.setup.ts      # Setup before Playwright tests run
│   └── environments/        # Environment variable files
├── src/
│   ├── ai/                  # Copilot prompt guideline files for UI/API generation
│   ├── api/                 # API engine, services, auth, fixtures, and types
│   ├── components/          # Reusable UI component wrappers
│   ├── constants/           # Global constants such as API endpoints
│   ├── data/                # Test data models, datasets, and provider logic
│   │   ├── datasets/        # JSON/YAML/CSV/Excel test payload files
│   │   ├── factory/         # Data provider factory
│   │   ├── models/          # Type definitions for test data
│   │   └── TestData.ts      # Central loader for test data
│   ├── fixtures/            # Playwright fixtures for UI tests
│   ├── hooks/               # Global hooks and lifecycle support
│   ├── locators/            # Shared UI locators if needed
│   ├── pages/               # Page object classes for UI flows
│   ├── reporting/           # Attachments and reporting helpers
│   ├── utils/               # Logging, utilities, and shared helpers
│   └── validators/          # Optional validation helpers for UI assertions
├── tests/
│   ├── api/                 # API test specs
│   ├── authentication/      # UI login test specs
│   └── checkout/            # UI checkout/e2e test specs
├── allure-report/          # Generated Allure report output (ignored)
├── allure-results/         # Generated Allure results (ignored)
├── logs/                   # Generated log files (ignored)
├── playwright-report/      # Generated Playwright HTML report (ignored)
├── test-results/           # Generated Playwright test results (ignored)
├── package.json
├── playwright.config.ts
└── Readme.md
```

## Detailed File and Folder Descriptions

### `config/`

- `envLoader.ts`: Loads environment variables from `config/environments/*.env` and exposes them through `ENV`.
- `global.setup.ts`: Runs once before all Playwright tests to create folders and initialize global state.
- `environments/`: Stores environment configuration files such as `qa.env` and `dev.env`.
  - Set `BASE_URL`, `API_BASE_URL`, `TEST_DATA_FORMAT`, and browser/execution options here.

### `src/ai/`

- Contains prompt guidance documents for Copilot or prompt-based generation.
- Prefer directory-based discovery of the relevant markdown file in this folder instead of hardcoding one exact filename.
- If a specific `*guidelines*.md` file is missing, fall back to the repository conventions in `tests/`, `src/pages/`, `src/api/`, and `src/components/`.
- Use these files to standardize how the framework should generate UI tests and API tests.

### `src/api/`

- `client/`: Core HTTP engine, request/response handling, retry policy, and API execution logic.
- `auth/`: Token management for authenticated API requests.
- `fixtures/`: API-specific fixture setup so API tests run in an isolated API context.
- `services/`: Reusable API service classes such as authentication and event services.
- `requests/`: Type definitions for request payloads.
- `responses/`: Type definitions for response shapes.
- `ApiFacade.ts`: Central registry for API services and scenario context.
- `context/`: Shared API scenario context storage.

### `src/components/`

- Reusable UI component wrappers and shared control abstractions.
- Use components for button, input, checkbox, and label interactions.
- Encourages consistency across page objects.

### `src/constants/`

- Stores constant values used across the framework.
- Example: `APIEndpoints.ts` centralizes endpoint paths.

### `src/data/`

- `datasets/`: Raw test data files, one subfolder per supported format, selected via `TEST_DATA_FORMAT`.
  - `json/`: JSON datasets (native nested structure).
  - `yaml/`: YAML datasets (native nested structure).
  - `csv/`: CSV datasets — flat `key,value,type` rows (dot-path `key`, optional `type` of `string`|`number`|`boolean`, default `string`).
  - `excel/`: Excel datasets (`.xlsx`) — same flat `key,value,type` row convention as CSV, one row per sheet row.
- `models/`: Type-safe interfaces for data payloads and test data shapes.
- `factory/`: Data provider factory that selects the JSON, YAML, CSV, or Excel provider.
- `utils/tabularData.ts`: Shared helper (`unflattenRows`) that rebuilds the nested object shape from CSV/Excel's flat rows, so all four formats produce identical objects for the same data model.
- `TestData.ts`: Unified API for loading data files in tests.

### `src/fixtures/`

- Playwright fixture definitions for UI tests.
- Encapsulates custom fixture behavior and shared setup.

### `src/hooks/`

- Test lifecycle hooks such as `beforeEach` and `afterEach`.
- Useful for logging, cleanup, and global test setup.

### `src/locators/`

- Shared locator definitions for selectors used across multiple pages.
- Helps keep selectors centralized when needed.

### `src/pages/`

- Page object classes for UI screens and flows.
- Encapsulate navigation, element actions, and page-level behavior.

### `src/reporting/`

- Helpers for attaching request/response logs to Playwright reports.
- Includes utilities for rich report attachments.

### `src/utils/`

- Shared utilities such as logger, date helpers, and common actions.
- `Logger.ts` is used across UI and API layers for consistent logging.

### `src/validators/`

- Optional assertion helpers for UI validation.
- Useful for reusable pass/fail checks inside specs.

### `tests/`

- `api/`: API test specifications and flows.
- `authentication/`: UI login test specifications.
- `checkout/`: UI end-to-end shopping/checkout test specifications.

### Root files

- `package.json`: Project scripts and dependencies.
- `playwright.config.ts`: Playwright test runner configuration.
- `Readme.md`: Project documentation and usage guide.

## How Test Data Works

### Secrets in test data

Real credential values never go into `src/data/datasets/*` — those files reference a placeholder
instead, and the actual value is resolved at load time:

```json
"validUser": {
  "email": "{{uiValidUserEmail}}",
  "password": "{{uiValidUserPassword}}"
}
```

(In YAML, quote the value — `"{{uiValidUserPassword}}"` — since `{{` is flow-mapping syntax otherwise.)

`TestData.load()` resolves every `{{key}}` placeholder against `Secrets.get(key)`
(`config/secretsLoader.ts`), which looks in two places, in order:

1. A real environment variable named exactly `key` (e.g. `uiValidUserPassword`) — this is how CI
   supplies values, via GitHub Actions repository secrets (see `.github/workflows/playwright-tests.yml`).
2. `config/secrets/<TEST_ENV>.env` — gitignored, local-only. Copy the matching
   `config/secrets/<env>.env.example` template to `<env>.env` and fill in real values to run locally.

A key referenced in test data but not found in either place throws immediately, so a missing secret
fails fast instead of silently sending the literal string `{{key}}` to the app.

`ApiEngine` also redacts anything named `password`/`token`/`authorization`/etc. before it reaches
logs or report attachments (see `src/utils/Redactor.ts`) — that protects a resolved secret value
once it's in flight, on top of keeping it out of the dataset files in the first place.

Test data is loaded through `src/data/TestData.ts`, which chooses a provider based on `TEST_DATA_FORMAT`.

- JSON data path: `src/data/datasets/json/*.json`
- YAML data path: `src/data/datasets/yaml/*.yaml`
- CSV data path: `src/data/datasets/csv/*.csv`
- Excel data path: `src/data/datasets/excel/*.xlsx`

JSON/YAML files hold the dataset's native nested structure directly. CSV/Excel files instead use flat rows with a header of `key,value,type`:

```csv
key,value,type
login.validUser.email,testaccountag@gmail.com,string
login.validUser.password,Test@1234,string
checkout.payment.cvv,123,string
event.createEvent.price,1500,number
```

- `key` is a dot-path into the resulting object (e.g. `checkout.payment.cvv`).
- `type` is optional and defaults to `string`; use `number` or `boolean` for non-string fields — otherwise the value is loaded as a string, unlike JSON/YAML where numeric/boolean types are implicit.

Example in a test file — `TestData.load` is async, so call it once via `test.beforeAll` rather than at module scope:

```ts
import { test } from "../../src/fixtures/testFixture";
import { TestData } from "../../src/data";
import { UiData } from "../../src/data/models/UiData";

test.describe("Authentication :: Login", () => {
  let uiData: UiData;

  test.beforeAll(async () => {
    uiData = await TestData.load<UiData>("uiData");
  });

  // tests use `uiData` here
});
```

This will load `uiData.json`, `uiData.yaml`, `uiData.csv`, or `uiData.xlsx` depending on `TEST_DATA_FORMAT`.

## Adding a UI Test

1. Create or update page objects in `src/pages/`.
2. Add reusable controls in `src/components/` if needed.
3. Add test data in `src/data/datasets/{json,yaml,csv,excel}/*` (same dataset in every supported format).
4. Add the test spec in `tests/<feature>/*.spec.ts` (e.g. `tests/authentication/`, `tests/checkout/`).
5. Use shared fixtures via `src/fixtures/testFixture.ts`.

### Example Files to Change for a new UI flow

- `src/pages/MyPage.ts`
- `src/components/*` (optional reusable controls)
- `src/data/models/*.ts`
- `src/data/datasets/{json,yaml,csv,excel}/*` (same dataset in every supported format)
- `tests/my-feature/my-feature.spec.ts`

## Adding an API Test

1. Add request models in `src/api/requests/*.ts`.
2. Add response models in `src/api/responses/*.ts`.
3. Add or extend service methods in `src/api/services/*.ts`.
4. Add test data to `src/data/datasets/{json,yaml,csv,excel}/*` (same dataset in every supported format).
5. Add the API spec in `tests/api/*.spec.ts`.

### Example Files to Change for a new API flow

- `src/api/requests/NewRequest.ts`
- `src/api/responses/NewResponse.ts`
- `src/api/services/NewService.ts`
- `src/data/models/*.ts`
- `src/data/datasets/{json,yaml,csv,excel}/*` (same dataset in every supported format)
- `tests/api/new-flow.spec.ts`

## Running Tests

Run all tests:

```bash
npm test
```

Run API tests only:

```bash
npm run api
```

Run UI tests only:

```bash
npm run ui
```

Run tests tagged `@smoke` or `@regression`:

```bash
npm run smoke
npm run regression
```

## Reporting

Show the Playwright HTML report after a run:

```bash
npm run report
```

Generate and open Allure report:

```bash
npm run allure-report
```

## Debugging

### API Debugging

- Enable detailed logs with `LOG_LEVEL=debug`.
- Confirm `TEST_DATA_FORMAT` loads the correct payload.
- Check `API_BASE_URL` in `config/environments/<env>.env`.
- Verify auth flow in `src/api/auth/TokenManager.ts` and service calls in `src/api/services/*.ts`.
- Use Playwright attachments from `RequestResponseAttachment` to review request/response content.

Example run:

```bash
LOG_LEVEL=debug npm run api
```

### UI Debugging

- Use built-in Playwright trace and screenshot output.
- Inspect `tests/authentication/*.spec.ts` and `tests/checkout/*.spec.ts` for page navigation and assertions.
- Review page actions in `src/pages/*.ts` and components in `src/components/`.
- Use `src/utils/Logger.ts` if additional debug logging is needed.

### Common debug workflow

1. Reproduce the failing test.
2. Inspect the relevant spec and page object.
3. Validate test data and environment values.
4. Rerun with `LOG_LEVEL=debug` for extra context.
5. Open Playwright trace or report if available.

## Notes

- Keep UI and API flows separate to reduce coupling.
- Use typed models and data-driven tests for stability.
- Use the Copilot guideline files under `src/ai/` by resolving the relevant `*guidelines*.md` document from that folder, rather than assuming one hardcoded filename. If the prompt file is absent, infer the test type from the repository structure and follow the stable source folders instead.

---

This README is the primary guide for framework usage, extension, and debugging.
