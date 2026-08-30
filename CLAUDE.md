# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A hybrid Playwright automation framework supporting separate **UI** and **API** test flows through distinct layered architectures that share a common test-data and reporting foundation, written **BDD-style**: scenarios live as Gherkin `.feature` files, executed via `playwright-bdd`, which generates native Playwright spec files from them at test-run time. TypeScript, `strict` mode, CommonJS/Node16 module resolution.

## Commands

```bash
npm test                # run full suite (bddgen, then playwright test)
npm run ui               # UI scenarios only -> playwright test .features-gen/ui
npm run api              # API scenarios only -> playwright test .features-gen/api
npm run smoke             # scenarios tagged @smoke
npm run regression       # scenarios tagged @regression
npm run bddgen           # regenerate .features-gen/ from features/**/*.feature without running tests
npm run typecheck        # tsc --noEmit
npm run report            # open last Playwright HTML report
npm run allure-report    # generate + open Allure report
```

Run a single feature file or scenario by name with Playwright's own filters (after `npm run bddgen`, or let the `pretest`/`pre*` npm hooks regenerate for you):
```bash
npx playwright test .features-gen/ui/authentication/login.feature.spec.js
npx playwright test -g "Valid user should login successfully"
```

Target a specific environment / data format via env vars (defaults: `TEST_ENV=qa`, format from that env file):
```bash
TEST_ENV=dev npm run ui
LOG_LEVEL=debug npm run api
```

Environment files live in `config/environments/<name>.env` (`qa`, `dev`) and are loaded by `config/envLoader.ts` into the frozen `ENV` object, keyed off `process.env.TEST_ENV`. Required keys (`BASE_URL`, `API_BASE_URL`, `TEST_DATA_FORMAT`) throw at load time if missing. `TEST_DATA_FORMAT` (`json`|`yaml`|`csv`|`excel`) selects which dataset provider `TestData.load()` uses.

CI (`.github/workflows/playwright-tests.yml`) runs on every push/PR: `npm ci` → `npm run typecheck` → install chromium → `npm run test` (with `TEST_ENV=qa`, `HEADLESS=true`; the `pretest` npm hook runs `bddgen` before Playwright starts), then uploads the HTML report and test-results as artifacts.

Only one Playwright project is configured: `chromium`.

## Architecture

The codebase enforces a hard split between **UI** and **API** test layers — they must not import each other's page objects/services except in explicit hybrid flows. Each layer has its own fixture, its own execution engine, and its own test-data model, but both funnel through the shared `TestData` loader, `src/utils/Logger`, and the same BDD generation pipeline.

### BDD layer (Gherkin → generated Playwright tests)

Flow: `features/**/*.feature` (Gherkin) → `src/bdd/steps/**/*.steps.ts` (`Given`/`When`/`Then` step definitions, built with `createBdd(test)` from `playwright-bdd`) → `playwright-bdd`'s `bddgen` generates one native Playwright spec per scenario into `.features-gen/` (gitignored, regenerated every run) → that generated file imports `test` from whichever fixtures file (`src/fixtures/testFixture.ts` or `src/api/fixtures/apiTest.ts`) the scenario's steps use.

- `playwright.config.ts` wires this up via `defineBddConfig({ features: "features/**/*.feature", steps: [...], featuresRoot: "features" })`; the returned path becomes `testDir`. Both `src/fixtures/testFixture.ts` and `src/api/fixtures/apiTest.ts` are listed directly in `steps` (alongside `src/bdd/steps/**/*.steps.ts`) — `bddgen` needs each fixtures file present there to resolve which custom `test` instance (and so which fixtures) a given scenario should import.
- Directory layout mirrors the old UI/API split: `features/ui/<feature>/<name>.feature` + `src/bdd/steps/ui/<feature>/<name>.steps.ts` for UI, `features/api/<name>.feature` + `src/bdd/steps/api/<name>.steps.ts` for API. Generated output mirrors this under `.features-gen/ui/...` / `.features-gen/api/...`, which is exactly what `npm run ui` / `npm run api` filter on by path.
- **`test as base` in both fixture files must come from `"playwright-bdd"`, not `"@playwright/test"`** — `createBdd()` requires the test instance used by step files to descend from playwright-bdd's own base fixtures (it adds `Given`/`When`/`Then`/`$bddContext`/etc.). `expect` still comes from `"@playwright/test"` as before.
- Tag every `Feature:` with its layer tag (`@ui` or `@api`) and propagate it to scenario-level `BeforeAll`/`AfterAll` hooks in step files via `BeforeAll({ tags: "@ui" }, async () => {...})` — these worker-level hooks are otherwise global across *every* generated feature file regardless of which steps a scenario actually uses, and an unscoped one bound to one layer's `test` instance will make `bddgen` fail to guess the right fixtures for scenarios in the other layer ("Found 2 test instances, but they should extend each other").
- `src/hooks/testHook.ts` exports `lifecycleLoggingFixture` — an **auto-fixture** (`{ auto: true }`), not a `test.beforeEach()`/`test.afterEach()` call — spread into both fixture files' `.extend()` to log each test's start/end. It must stay a fixture: `bddgen` loads step files (and the fixtures file they import `test` from) outside an active Playwright suite while discovering steps, and `test.beforeEach()` throws in that context; a plain fixture doesn't touch the suite stack at module-load time.
- Reuse the same `Given`/`When`/`Then` step text across scenarios where the behavior is identical — playwright-bdd matches steps by text across `Given`/`When`/`Then`/`And`/`But` regardless of which of those a `.feature` file's line uses.
- Scenario-local state that a single scenario's steps need to share (e.g. a UI `productName` searched in one step and asserted in a later one) lives as a module-scoped variable in that step file — safe because a single worker runs one scenario's steps to completion before starting another. For API scenario state shared across steps, prefer `api.setContextValue()`/`api.getContextValue()` (see API layer below) over a module-scoped variable, matching the non-BDD convention.

### UI layer (Page Object Model)

Flow: `features/ui/**/*.feature` → `src/bdd/steps/ui/**/*.steps.ts` → `src/fixtures/testFixture.ts` (injects page objects, adds `lifecycleLoggingFixture`) → `src/pages/*.ts` (extends `BasePage`) → `src/components/*` (extends `BaseComponent`, wraps a `Locator`) → `src/locators/*.ts`.

- `src/pages/BasePage.ts` — shared navigation/assertion primitives (`navigate`, `verifyUrl`, `verifyTitle`, `waitForLoad`). Page objects extend this and compose components; they must not contain assertions or business rules (those belong in `src/validators/*.ts`).
- `src/components/` — `Button`, `TextBox`, `CheckBox`, `Label` wrap a `Locator` via `BaseComponent` (visibility/enabled state helpers, `locatorElement()`). Page objects build up UI actions from these rather than raw `page.locator()` calls.
- `src/validators/*.ts` — static assertion helpers (e.g. `LoginValidator`) keep `expect(...)` calls out of page objects; BDD `Then` steps call these instead of asserting inline.
- `src/reporting/AllureHelper.ts` — wrap logical UI actions in `AllureHelper.step(name, fn)` for step-level Allure reporting (see `LoginPage.login`).

### API layer (service-based)

Flow: `features/api/*.feature` → `src/bdd/steps/api/*.steps.ts` → `src/api/fixtures/apiTest.ts` (extends `test` with an `api` fixture, adds `lifecycleLoggingFixture`) → `src/api/fixtures/apiFixture.ts` (builds a Playwright `APIRequestContext`, `TokenManager`, `ApiEngine`, `ApiFacade`) → `src/api/ApiFacade.ts` → `src/api/services/*.ts` → `src/api/client/ApiEngine.ts` → Playwright request context → backend.

- Step definitions never call `request.newContext()` or raw HTTP methods directly — everything goes through `api.service("<name>")` methods (`auth`, `event`, `user`), registered in `src/api/services/index.ts`.
- `ApiFacade` also exposes scenario-scoped state: `setContextValue()` / `getContextValue()` / `hasContextValue()` / `removeContextValue()`, backed by `src/api/context/ApiScenarioContext.ts`. Use this instead of module-scoped variables to carry values (auth token, created resource id) between `Given`/`When`/`Then` steps in the same scenario — see `src/bdd/steps/api/event.steps.ts`.
- `src/api/client/ApiEngine.ts` builds headers/URLs, executes the request, attaches request/response data for reporting (`src/reporting/RequestResponseAttachment.ts`), parses the body, and converts non-2xx failures into typed exceptions from `src/api/exception/*.ts` (`AuthenticationException`, `ValidationException`, `ResourceNotFoundException`, `ServerException`).
- `src/api/client/RetryPolicy.ts` — retry wrapper used by the engine for flaky calls.
- `src/api/auth/TokenManager.ts` — holds the bearer token set after `auth` service login; consumed by `ApiEngine` for authenticated requests.
- New endpoints: add typed request/response shapes in `src/api/requests/` / `src/api/responses/`, add the path to `src/constants/APIEndpoints.ts`, add/extend a service method — never hardcode endpoint strings in a step definition.
- Full request-flow diagrams and per-file rationale live in `api-overview.md` (and its subset `api.md`) at the repo root.

### Test data

`src/data/TestData.ts` is the single entry point: `await TestData.load<T>("fileName")` picks a provider via `src/data/factory/DataProviderFactory.ts`, keyed on `ENV.TEST_DATA_FORMAT`. Providers (`JsonProvider`/`YamlProvider`/`CsvProvider`/`ExcelProvider`, all implementing `IDataProvider`) read from `src/data/datasets/<format>/*.<ext>` (`json`, `yaml`, `csv`, `excel` → `.xlsx`) — the same logical dataset must exist in every format. `load()` is async (the Excel provider reads via `exceljs`, which has no sync API) and results are cached per provider instance, so call it once from a step file's `BeforeAll({ tags: "@ui" | "@api" }, ...)` hook rather than at module scope — see `src/bdd/steps/ui/authentication/login.steps.ts` for the pattern.

`JsonProvider`/`YamlProvider` parse the file's native nested structure directly. `CsvProvider`/`ExcelProvider` instead read flat `key,value,type` rows (header required) — `key` is a dot-path (e.g. `checkout.payment.cvv`), `type` is optional and one of `string` (default) | `number` | `boolean`. Both are rebuilt into the same nested shape via `unflattenRows` in `src/data/utils/tabularData.ts`, so all four formats produce identical objects and the same data models work unchanged. Always set an explicit `type` for non-string values (e.g. `price,1500,number`) — CSV/Excel values are otherwise treated as strings, unlike JSON/YAML where numeric/boolean types are implicit.

Current datasets/models:
- `uiData.{json,yaml,csv,xlsx}` + `src/data/models/UiData.ts` — used by UI steps (e.g. login users).
- `apiData.{json,yaml,csv,xlsx}` + `src/data/models/ApiData.ts` — used by API steps (login + event payloads); reuses request types like `CreateEventRequest` from `src/api/requests/EventRequest.ts` so payload shape stays in sync with the service layer.

Both data models reuse the shared domain type `src/models/User.ts` for credentials. When adding a new dataset, add the file for every supported format (JSON, YAML, CSV, Excel), add a typed model in `src/data/models/`, and export it from `src/data/models/index.ts`.

**Secrets in test data:** never put a real credential value directly in `src/data/datasets/*`, and never in a `.feature` file either — reference it as a `{{key}}` placeholder in the dataset instead (e.g. `"password": "{{uiValidUserPassword}}"`, quoted in YAML since `{{` is flow-mapping syntax there), and have step definitions resolve a *named* data-set entry (e.g. `When I log in with the "validUser" credentials` → step looks up `uiData.login.validUser`) rather than passing literal credential values through Gherkin step text. `BaseDataProvider.load()` resolves every such placeholder via `resolveSecrets()` (`src/data/utils/resolveSecrets.ts`) against `Secrets.get()` (`config/secretsLoader.ts`), which checks a real environment variable of the same name first, then falls back to the gitignored `config/secrets/<env>.env` (copy the matching `*.env.example` template locally; CI supplies the env vars from GitHub Actions repository secrets — see `.github/workflows/playwright-tests.yml`). A referenced key that resolves to nothing throws immediately rather than silently sending the literal `{{key}}` string to the app.

### Shared building blocks

- `src/utils/Logger.ts` — Winston-based logger used by both UI and API layers; logs to `logs/*.log`. Prefer this over `console.log`.
- `src/utils/DateUtils.ts` — date helpers (e.g. `getFutureDateIso`) for building relative test-data timestamps at runtime rather than hardcoding dates.
- `src/utils/CommonActions.ts` — shared cross-cutting UI actions.
- `src/constants/` — barrel-exported (`src/constants/index.ts`) global constants: `AppRoutes` (UI routes), `API_ENDPOINTS` (API paths), `Messages` (expected copy for assertions), `TestTags` (`@smoke`, `@regression`, etc. — mirror these as Gherkin tags above `Feature:`/`Scenario:` lines and with `--grep`/`npm run smoke`).
- `src/reporting/` — `AllureHelper` (step wrapping), `AttachmentHelper`, `RequestResponseAttachment` (API req/res attached to the Playwright/Allure report).

## Conventions when extending the framework

These mirror the Copilot generation guidelines in `src/ai/copilot-ui-test-guidelines.md` and `src/ai/copilot-api-test-guidelines.md` (with worked examples in `src/ai/example-ui-code.md` / `example-api-code.md`) — treat those as the canonical contract when generating new UI or API flows, and prefer discovering the current `*guidelines*.md` file under `src/ai/` over assuming a fixed filename if this project's layout changes.

- Keep UI and API test logic strictly separate; don't import one layer's page objects/services into the other's step definitions.
- New UI flow: page object(s) in `src/pages/`, component wrappers in `src/components/` if needed, constants in `src/constants/`, dataset + model under `src/data/`, validator in `src/validators/`, a `.feature` in `features/ui/<feature>/<name>.feature`, step definitions in `src/bdd/steps/ui/<feature>/<name>.steps.ts` using `src/fixtures/testFixture.ts`.
- New API flow: request/response models in `src/api/requests/` / `src/api/responses/`, endpoint constant, service method (extend before adding ad-hoc calls), dataset + model under `src/data/`, a `.feature` in `features/api/<name>.feature`, step definitions in `src/bdd/steps/api/<name>.steps.ts` using `src/api/fixtures/apiTest.ts`.
- File naming: `<name>.feature` for scenarios, `<name>.steps.ts` for the matching step definitions; tag smoke-critical scenarios with `@smoke` above the `Scenario:` line (see `TestTags`/`npm run smoke`).
- After adding or editing a `.feature` file or step definitions, run `npm run bddgen` (or let a `pre*` npm script do it) before running Playwright directly against `.features-gen/`.
