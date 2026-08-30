# Copilot API Test Generation Guidelines

This prompt file describes the accepted standards for generating API automation in this Playwright framework.

## Purpose

Use these guidelines when generating new API scenarios, service classes, request/response models, and test data files. This framework writes scenarios BDD-style: Gherkin `.feature` files executed via `playwright-bdd`, which generates native Playwright spec files from them at test-run time (`npm run bddgen`, or automatically via the `pretest`/`pre*` npm hooks).

## File locations

- API feature files: `features/api/*.feature`
- API step definitions: `src/bdd/steps/api/*.steps.ts`
- API client and fixtures: `src/api/fixtures/*.ts`
- API engine/core client: `src/api/client/*.ts`
- API services: `src/api/services/*.ts`
- Request payload models: `src/api/requests/*.ts`
- Response models: `src/api/responses/*.ts`
- Endpoint/constants files: `src/constants/*.ts`
- Shared API utilities: `src/api/*` and `src/utils/*`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/{json,yaml,csv,excel}/*` (same logical dataset in every supported format; CSV/Excel use flat `key,value,type` rows — see below)

## Standards for API test generation

1. Use a service-based API layer underneath the BDD steps.
   - Define reusable service classes in `src/api/services/*`.
   - Encapsulate HTTP method details in `src/api/client/ApiEngine.ts`.
   - Keep endpoint paths centralized in `src/constants/*.ts` such as `APIEndpoints.ts`.
   - Keep request logic separate from step definitions.
   - Never bypass the service layer by calling `request.newContext()` or raw `APIRequestContext` methods directly inside step definitions.

2. Keep API scenarios declarative.
   - Write scenarios as `Given`/`When`/`Then` in `features/api/*.feature`, tagging each `Feature:` with `@api` and each `Scenario:` with the tags it needs (`@smoke`, `@regression`, ...).
   - Implement steps in `src/bdd/steps/api/*.steps.ts` with `createBdd(test)` from `playwright-bdd`, where `test` is imported from `src/api/fixtures/apiTest.ts`.
   - Use service methods like `api.service("auth").login(...)` and `api.service("event").createEvent(...)` inside step functions.
   - Keep `expect(...)` assertions in `Then` steps and business logic in service or helper classes.
   - Use the shared fixture and `api` object from `src/api/fixtures/apiTest.ts` for setup, auth, and scenario context.
   - Prefer `Scenario Outline` + `Examples` over multiple near-duplicate `Scenario`s that only differ by one data value (e.g. several invalid-payload cases against the same endpoint) — see `features/ui/authentication/login.feature` for the pattern. Name the outline itself with the column placeholder so each generated example gets a readable title instead of the default `Example #1`/`Example #2`.

3. Use typed request and response models.
   - Define request payloads in `src/api/requests/*.ts`.
   - Define response shapes in `src/api/responses/*.ts`.
   - Use these types in services and step definitions for type safety.

### Hard rules / anti-patterns

- Do not create new API scenarios as `.spec.ts`; this repository standard is `features/api/*.feature` + `src/bdd/steps/api/*.steps.ts`, generated into `.features-gen/api/` by `npm run bddgen` (gitignored — never hand-edit or commit generated output).
- Do not hand-write endpoint URLs or HTTP headers in step definitions when a service method already exists.
- If a flow needs `create`, `update`, or `delete`, extend the service class first, then call the new method from the step definition.
- Store reusable auth and resource values in `api.setContextValue(...)` and retrieve them with `api.getContextValue(...)` instead of module-scoped variables that are not shared across steps.
- Centralize payload templates in test data files and load them with `TestData.load<T>("filename")` rather than embedding ad-hoc JSON directly in a step definition.
- `TestData.load<T>("filename")` is async — call it once via `await` inside a step file's `BeforeAll({ tags: "@api" }, async () => {...})` hook (from `createBdd(test)`), not at module scope. Scope every `BeforeAll`/`AfterAll` with the layer tag (`@api`) — an unscoped one is global across every generated feature file, including the UI layer's, and will break `bddgen`'s ability to guess which fixtures a scenario needs.

4. Use centralized test data.
   - Store API payload templates in `src/data/datasets/{json,yaml,csv,excel}/*` — add the file for every supported format the project uses.
   - JSON/YAML hold the nested structure directly. CSV/Excel use flat `key,value,type` rows instead (dot-path `key`, e.g. `apiEvent.createEvent.price`; optional `type` of `string`|`number`|`boolean`, default `string` — set it explicitly for numeric fields like `price` or `totalSeats`).
   - Load data with `await TestData.load<T>("filename")` inside a `BeforeAll({ tags: "@api" }, ...)` hook.
   - Real credential values (a working account's email/password) go in as `{{key}}` placeholders, not literal values — `resolveSecrets()` (`src/data/utils/resolveSecrets.ts`) resolves them against `config/secrets/<env>.env` at load time. Never put a literal credential in a `.feature` file's step text — pass a named key and have the step definition look it up in the loaded dataset.
   - Map payloads to typed models where possible.

5. Handle auth and shared state in fixtures.
   - Use `src/api/fixtures/apiFixture.ts` and `src/api/fixtures/apiTest.ts` for setup.
   - Keep API token storage in `src/api/auth/TokenManager.ts`.
   - Do not mix API auth state with UI fixtures.

6. Keep API and UI separate.
   - API scenarios go in `features/api/` + `src/bdd/steps/api/`; UI scenarios go in `features/ui/` + `src/bdd/steps/ui/`.
   - Do not import UI page objects into API step definitions.
   - Do not import API service classes into UI step definitions unless explicitly building hybrid flow support.

7. Logging and reporting.
   - Use `src/utils/Logger.ts` for API-level logging.
   - Add request/response attachments to Playwright test report when available.
   - Avoid printing verbose logs in normal test output unless debugging.

## What to generate when adding a new API flow

1. Add request and response models for the new endpoint.
2. Add or update endpoint constants in `src/constants/*.ts` such as `APIEndpoints.ts`.
3. Add a new service method in `src/api/services/<ServiceName>Service.ts`.
4. Add or update test data in `src/data/datasets/{json,yaml,csv,excel}/*` (same dataset in every supported format).
5. Write the scenario in `features/api/<feature>.feature` (`Given`/`When`/`Then`, tagged `@api` plus any of `@smoke`/`@regression`).
6. Implement the steps in `src/bdd/steps/api/<feature>.steps.ts` using `createBdd(test)` with `test` from `src/api/fixtures/apiTest.ts` — keep test setup and auth handling consistent with existing steps.
7. Run `npm run bddgen` to regenerate `.features-gen/` before running the scenario.

## Example

Use [example-api-code.md](example-api-code.md) as the canonical reference contract for API generation in this repository. It shows the expected service-based structure for a login + event creation flow, including request/response models, endpoint constants, services, datasets, and the final feature/step-definition shape.

The example contract maps to the repository layout below:

- `src/api/requests/LoginRequest.ts`
- `src/api/responses/LoginResponse.ts`
- `src/constants/APIEndpoints.ts`
- `src/api/services/AuthenticationService.ts`
- `src/api/services/EventService.ts`
- `src/data/datasets/json/authentication.json` (and its `yaml`/`csv`/`excel` counterparts)
- `features/api/authentication.feature`
- `src/bdd/steps/api/authentication.steps.ts`

## Prompt instructions for Copilot

When generating a new API scenario or service class, follow this structure:

- Determine the API endpoint and the scenario to validate.
- Create request/response models first.
- Create or extend service methods to represent endpoint behavior.
- Keep scenarios readable and data-driven; keep payload values out of `.feature` step text.
- Use existing fixtures for setup and token management.
- Keep API generation aligned with the file locations above.
- Use [example-api-code.md](example-api-code.md) as the concrete shape reference when the generated flow needs a full implementation pattern.
- If this file is missing or renamed in another project, do not fail the prompt. Discover the relevant `*api*guidelines*.md` document under `src/ai/` or fall back to the stable repository conventions in `features/api/`, `src/bdd/steps/api/`, `src/api/`, and `src/data/`.
- After generating or editing a `.feature` file or step definitions, run `npm run bddgen` (regenerates `.features-gen/`) and `npm run typecheck` before reporting done.

---

Use the relevant guideline file in `src/ai/` as the canonical source for new API automation generation in this repository.
