# Playwright Framework

A hybrid Playwright automation framework that supports separate UI and API test flows, reusable page objects/components, centralized test data, and structured reporting.

## Key Advantages

- Separate UI and API test layers for maintainability
- Reusable page objects and component wrappers
- Service-based API layer with token management
- Centralized test data with JSON/YAML support
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
   - `TEST_DATA_FORMAT` set to `json` or `yaml`

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
│   │   ├── datasets/        # JSON/YAML test payload files
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
│   ├── ui/                  # UI test specs
│   └── authentication/      # Existing authentication UI tests
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
- Contains guidance documents for Copilot or prompt-based generation.
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
- `datasets/`: Raw test data files in JSON or YAML format.
  - `json/`: JSON datasets.
  - `yaml/`: YAML datasets, supported via `TEST_DATA_FORMAT`.
- `models/`: Type-safe interfaces for data payloads and test data shapes.
- `factory/`: Data provider factory that selects JSON or YAML provider.
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
- `ui/`: UI test specifications for end-to-end browser scenarios.
- `authentication/`: Existing authentication-focused tests.

### Root files
- `package.json`: Project scripts and dependencies.
- `playwright.config.ts`: Playwright test runner configuration.
- `Readme.md`: Project documentation and usage guide.

## How Test Data Works

Test data is loaded through `src/data/TestData.ts`, which chooses a provider based on `TEST_DATA_FORMAT`.

- JSON data path: `src/data/datasets/json/*.json`
- YAML data path: `src/data/datasets/yaml/*.yaml`

Example in a test file:

```ts
import { TestData } from "../../src/data";
import { AuthenticationData } from "../../src/data/models/AuthenticationData";

const authentication = TestData.load<AuthenticationData>("authentication");
```

This will load either `authentication.json` or `authentication.yaml` depending on `TEST_DATA_FORMAT`.

## Adding a UI Test

1. Create or update page objects in `src/pages/`.
2. Add reusable controls in `src/components/` if needed.
3. Add test data in `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`.
4. Add the test spec in `tests/ui/*.spec.ts`.
5. Use shared fixtures via `src/fixtures/testFixture.ts`.

### Example Files to Change for a new UI flow

- `src/pages/MyPage.ts`
- `src/components/*` (optional reusable controls)
- `src/data/models/*.ts`
- `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`
- `tests/ui/my-feature.spec.ts`

## Adding an API Test

1. Add request models in `src/api/requests/*.ts`.
2. Add response models in `src/api/responses/*.ts`.
3. Add or extend service methods in `src/api/services/*.ts`.
4. Add test data to `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`.
5. Add the API spec in `tests/api/*.spec.ts`.

### Example Files to Change for a new API flow

- `src/api/requests/NewRequest.ts`
- `src/api/responses/NewResponse.ts`
- `src/api/services/NewService.ts`
- `src/data/models/*.ts`
- `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`
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

Run hybrid tests:

```bash
npm run hybrid
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
- Inspect `tests/ui/*.spec.ts` for page navigation and assertions.
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
- Use the Copilot guideline files in `src/ai/` if you want to generate UI or API tests from a prompt.

---

This README is the primary guide for framework usage, extension, and debugging.