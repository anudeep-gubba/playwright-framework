# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A hybrid Playwright automation framework supporting separate **UI** and **API** test flows through distinct layered architectures that share a common test-data and reporting foundation. TypeScript, `strict` mode, CommonJS/Node16 module resolution.

## Commands

```bash
npm test                # run full suite (playwright test)
npm run ui               # UI tests only -> playwright test tests/authentication
npm run api              # API tests only -> playwright test tests/api
npm run smoke             # tests tagged @smoke
npm run typecheck        # tsc --noEmit
npm run report            # open last Playwright HTML report
npm run allure-report    # generate + open Allure report
```

Run a single test file or test by name with Playwright's own filters, e.g.:
```bash
npx playwright test tests/authentication/login.spec.ts
npx playwright test -g "Valid user should login successfully"
```

Target a specific environment / data format via env vars (defaults: `TEST_ENV=qa`, format from that env file):
```bash
TEST_ENV=dev npm run ui
LOG_LEVEL=debug npm run api
```

Environment files live in `config/environments/<name>.env` (`qa`, `dev`) and are loaded by `config/envLoader.ts` into the frozen `ENV` object, keyed off `process.env.TEST_ENV`. Required keys (`BASE_URL`, `API_BASE_URL`, `TEST_DATA_FORMAT`) throw at load time if missing. `TEST_DATA_FORMAT` (`json`|`yaml`|`csv`|`excel`) selects which dataset provider `TestData.load()` uses.

CI (`.github/workflows/playwright-tests.yml`) runs on every push/PR: `npm ci` → `npm run typecheck` → install chromium → `npm run test` (with `TEST_ENV=qa`, `HEADLESS=true`), then uploads the HTML report and test-results as artifacts.

Only one Playwright project is configured: `chromium`.

## Architecture

The codebase enforces a hard split between **UI** and **API** test layers — they must not import each other's page objects/services except in explicit hybrid flows. Each layer has its own fixture, its own execution engine, and its own test-data model, but both funnel through the shared `TestData` loader and `src/utils/Logger`.

### UI layer (Page Object Model)

Flow: `tests/authentication/*.spec.ts` → `src/fixtures/testFixture.ts` (injects page objects, registers hooks) → `src/pages/*.ts` (extends `BasePage`) → `src/components/*` (extends `BaseComponent`, wraps a `Locator`) → `src/locators/*.ts`.

- `src/pages/BasePage.ts` — shared navigation/assertion primitives (`navigate`, `verifyUrl`, `verifyTitle`, `waitForLoad`). Page objects extend this and compose components; they must not contain assertions or business rules (those belong in `src/validators/*.ts`).
- `src/components/` — `Button`, `TextBox`, `CheckBox`, `Label` wrap a `Locator` via `BaseComponent` (visibility/enabled state helpers, `locatorElement()`). Page objects build up UI actions from these rather than raw `page.locator()` calls.
- `src/fixtures/testFixture.ts` — extends Playwright's `test` with page-object fixtures (e.g. `loginPage`) and calls `registerTestHooks` from `src/hooks/testHook.ts`, which wires `beforeEachHook`/`afterEachHook`.
- `src/validators/*.ts` — static assertion helpers (e.g. `LoginValidator`) keep `expect(...)` calls out of page objects and specs.
- `src/reporting/AllureHelper.ts` — wrap logical UI actions in `AllureHelper.step(name, fn)` for step-level Allure reporting (see `LoginPage.login`).

### API layer (service-based)

Flow: `tests/api/*.spec.ts` → `src/api/fixtures/apiTest.ts` (extends `test` with an `api` fixture) → `src/api/fixtures/apiFixture.ts` (builds a Playwright `APIRequestContext`, `TokenManager`, `ApiEngine`, `ApiFacade`) → `src/api/ApiFacade.ts` → `src/api/services/*.ts` → `src/api/client/ApiEngine.ts` → Playwright request context → backend.

- Tests never call `request.newContext()` or raw HTTP methods directly — everything goes through `api.service("<name>")` methods (`auth`, `event`, `user`), registered in `src/api/services/index.ts`.
- `ApiFacade` also exposes scenario-scoped state: `setContextValue()` / `getContextValue()` / `hasContextValue()` / `removeContextValue()`, backed by `src/api/context/ApiScenarioContext.ts`. Use this instead of local variables to carry values (auth token, created resource id) between steps in the same test — see `tests/api/event.spec.ts`.
- `src/api/client/ApiEngine.ts` builds headers/URLs, executes the request, attaches request/response data for reporting (`src/reporting/RequestResponseAttachment.ts`), parses the body, and converts non-2xx failures into typed exceptions from `src/api/exception/*.ts` (`AuthenticationException`, `ValidationException`, `ResourceNotFoundException`, `ServerException`).
- `src/api/client/RetryPolicy.ts` — retry wrapper used by the engine for flaky calls.
- `src/api/auth/TokenManager.ts` — holds the bearer token set after `auth` service login; consumed by `ApiEngine` for authenticated requests.
- New endpoints: add typed request/response shapes in `src/api/requests/` / `src/api/responses/`, add the path to `src/constants/APIEndpoints.ts`, add/extend a service method — never hardcode endpoint strings in a test.
- Full request-flow diagrams and per-file rationale live in `api-overview.md` (and its subset `api.md`) at the repo root.

### Test data

`src/data/TestData.ts` is the single entry point: `TestData.load<T>("fileName")` picks a provider via `src/data/factory/DataProviderFactory.ts`, keyed on `ENV.TEST_DATA_FORMAT`. Providers (`JsonProvider`/`YamlProvider`/`CsvProvider`/`ExcelProvider`, all implementing `IDataProvider`) read from `src/data/datasets/<format>/*.<ext>` (`json`, `yaml`, `csv`, `excel` → `.xlsx`) — the same logical dataset must exist in every format.

`JsonProvider`/`YamlProvider` parse the file's native nested structure directly. `CsvProvider`/`ExcelProvider` instead read flat `key,value,type` rows (header required) — `key` is a dot-path (e.g. `checkout.payment.cvv`), `type` is optional and one of `string` (default) | `number` | `boolean`. Both are rebuilt into the same nested shape via `unflattenRows` in `src/data/utils/tabularData.ts`, so all four formats produce identical objects and the same data models work unchanged. Always set an explicit `type` for non-string values (e.g. `price,1500,number`) — CSV/Excel values are otherwise treated as strings, unlike JSON/YAML where numeric/boolean types are implicit.

Current datasets/models:
- `uiData.{json,yaml,csv,xlsx}` + `src/data/models/UiData.ts` — used by UI specs (e.g. login users).
- `apiData.{json,yaml,csv,xlsx}` + `src/data/models/ApiData.ts` — used by API specs (login + event payloads); reuses request types like `CreateEventRequest` from `src/api/requests/EventRequest.ts` so payload shape stays in sync with the service layer.

Both data models reuse the shared domain type `src/models/User.ts` for credentials. When adding a new dataset, add the file for every supported format (JSON, YAML, CSV, Excel), add a typed model in `src/data/models/`, and export it from `src/data/models/index.ts`.

### Shared building blocks

- `src/utils/Logger.ts` — Winston-based logger used by both UI and API layers; logs to `logs/*.log`. Prefer this over `console.log`.
- `src/utils/DateUtils.ts` — date helpers (e.g. `getFutureDateIso`) for building relative test-data timestamps at runtime rather than hardcoding dates.
- `src/utils/CommonActions.ts` — shared cross-cutting UI actions.
- `src/constants/` — barrel-exported (`src/constants/index.ts`) global constants: `AppRoutes` (UI routes), `API_ENDPOINTS` (API paths), `Messages` (expected copy for assertions), `TestTags` (`@smoke`, `@regression`, etc. used with `test.describe`/`--grep`).
- `src/reporting/` — `AllureHelper` (step wrapping), `AttachmentHelper`, `RequestResponseAttachment` (API req/res attached to the Playwright/Allure report).

## Conventions when extending the framework

These mirror the Copilot generation guidelines in `src/ai/copilot-ui-test-guidelines.md` and `src/ai/copilot-api-test-guidelines.md` (with worked examples in `src/ai/example-ui-code.md` / `example-api-code.md`) — treat those as the canonical contract when generating new UI or API flows, and prefer discovering the current `*guidelines*.md` file under `src/ai/` over assuming a fixed filename if this project's layout changes.

- Keep UI and API test logic strictly separate; don't import one layer's page objects/services into the other's specs.
- New UI flow: page object(s) in `src/pages/`, component wrappers in `src/components/` if needed, constants in `src/constants/`, dataset + model under `src/data/`, validator in `src/validators/`, spec in `tests/<feature>/*.spec.ts` using `src/fixtures/testFixture.ts`.
- New API flow: request/response models in `src/api/requests/` / `src/api/responses/`, endpoint constant, service method (extend before adding ad-hoc calls), dataset + model under `src/data/`, spec in `tests/api/*.spec.ts` using `src/api/fixtures/apiTest.ts`.
- Test file naming: `<feature>.spec.ts`; tag smoke-critical tests with `@smoke` in the test title (see `TestTags`/`npm run smoke`).
