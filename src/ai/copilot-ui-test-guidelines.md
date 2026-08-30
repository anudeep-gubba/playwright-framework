# Copilot UI Test Generation Guidelines

This prompt file describes the accepted standards for generating UI automation in this Playwright framework.

## Purpose

Use these guidelines when generating new UI scenarios, page objects, component wrappers, and test data files. This framework writes scenarios BDD-style: Gherkin `.feature` files executed via `playwright-bdd`, which generates native Playwright spec files from them at test-run time (`npm run bddgen`, or automatically via the `pretest`/`pre*` npm hooks).

## File locations

- UI feature files: `features/ui/<feature>/*.feature`
- UI step definitions: `src/bdd/steps/ui/<feature>/*.steps.ts`
- Page objects: `src/pages/*.ts`
- Reusable page components: `src/components/*`
- Test fixtures: `src/fixtures/testFixture.ts`
- Shared domain/models: `src/models/*.ts`
- Shared route and app constants: `src/constants/*.ts`
- Validators and UI expectations: `src/validators/*.ts`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/{json,yaml,csv,excel}/*` (same logical dataset in every supported format; CSV/Excel use flat `key,value,type` rows — see below)
- Locators: `src/locators/*` or inside page object classes when locator-specific files are not needed
- Helpers / utils: `src/utils/*`

## Standards for UI test generation

1. Use the Page Object Model underneath the BDD steps.
   - Place high-level page actions in `src/pages/*`.
   - Keep selector logic in page objects or dedicated locator files.
   - Do not place test assertions or business rules in page object methods — call `src/validators/*.ts` from `Then` steps instead.

2. Keep scenarios and step definitions simple and readable.
   - Write scenarios as `Given`/`When`/`Then` in `features/ui/<feature>/*.feature`, tagging each `Feature:` with `@ui` and each `Scenario:` with the tags it needs (`@smoke`, `@regression`, `@negative`, ...).
   - Implement steps in `src/bdd/steps/ui/<feature>/*.steps.ts` with `createBdd(test)` from `playwright-bdd`, where `test` is imported from `src/fixtures/testFixture.ts`.
   - Reuse existing step text across scenarios instead of writing near-duplicate steps — playwright-bdd matches by text regardless of whether a `.feature` line uses `Given`/`When`/`Then`/`And`/`But`.
   - Prefer `Scenario Outline` + `Examples` over multiple near-duplicate `Scenario`s that only differ by one data value (e.g. two negative-credential cases) — see `features/ui/authentication/login.feature`. Name the outline itself with the column placeholder (e.g. `Scenario Outline: Invalid <credentialKey> should display a login error`) so each generated example gets a readable title instead of the default `Example #1`/`Example #2`.
   - Keep navigation routes and app constants centralized in `src/constants/*.ts`.
   - Each scenario should verify one application behavior.

3. Use reusable components.
   - Common controls such as buttons, text fields, checkboxes, and labels belong under `src/components/`.
   - Import `src/components` into page objects when building reusable UI actions.

4. Use centralized test data.
   - Store static test data in `src/data/datasets/{json,yaml,csv,excel}/*` — add the file for every supported format the project uses.
   - JSON/YAML hold the nested structure directly. CSV/Excel use flat `key,value,type` rows instead (dot-path `key`, e.g. `login.validUser.email`; optional `type` of `string`|`number`|`boolean`, default `string`).
   - Define type-safe data shapes in `src/data/models/*.ts`.
   - Reuse shared domain types from `src/models/*.ts` when the page object needs request payload contracts.
   - `TestData.load<T>("filename")` is async — call it once via `await` inside a step file's `BeforeAll({ tags: "@ui" }, async () => {...})` hook (from `createBdd(test)`), assigning to a `let` declared above it, not at module scope (see `src/bdd/steps/ui/authentication/login.steps.ts`). Scope every `BeforeAll`/`AfterAll` with the layer tag (`@ui`) — an unscoped one is global across every generated feature file, including the API layer's, and will break `bddgen`'s ability to guess which fixtures a scenario needs.
   - Real credential values (a working account's email/password) go in as `{{key}}` placeholders, not literal values — `resolveSecrets()` (`src/data/utils/resolveSecrets.ts`) resolves them against `config/secrets/<env>.env` at load time. Deliberately-invalid test values (wrong password, wrong email) aren't secrets and stay literal. Either way, never put a literal credential (real or deliberately-wrong) directly in a `.feature` file's step text — pass a named key (e.g. `the "validUser" credentials`) and have the step definition look it up in the loaded dataset.

5. Naming conventions.
   - Page object files: `LoginPage.ts`, `RegistrationPage.ts`, etc.
   - Feature files: `login.feature`, `registration.feature`, etc.
   - Step definition files: `login.steps.ts`, `registration.steps.ts`, etc.
   - Component files: `Button.ts`, `TextBox.ts`, `CheckBox.ts`, `Label.ts`.

6. Keep API and UI separate.
   - Do not add API step logic or token handling to `src/bdd/steps/ui/*`.
   - API flows belong in `features/api/*.feature`, `src/bdd/steps/api/*.steps.ts`, and `src/api/*`.

7. Logging and reporting.
   - If a UI helper needs logging, use `src/utils/Logger.ts`.
   - Keep reusable assertion helpers in `src/validators/*.ts` instead of embedding validation logic in page objects or step definitions.
   - Do not generate console output from tests unless it aids debugging.

## What to generate when adding a new UI flow

1. Create page classes for each page involved in the scenario.
2. Add or update component wrappers in `src/components` if reusable elements are needed.
3. Add or update shared constants in `src/constants/*.ts` for routes or app-level values.
4. Add test data to `src/data/datasets/{json,yaml,csv,excel}/*` (same dataset in every supported format) and corresponding models in `src/data/models/*.ts`.
5. Add or update validators in `src/validators/*.ts` when assertions are reused across scenarios.
6. Write the scenario in `features/ui/<feature>/<name>.feature` (`Given`/`When`/`Then`, tagged `@ui` plus any of `@smoke`/`@regression`/`@negative`).
7. Implement the steps in `src/bdd/steps/ui/<feature>/<name>.steps.ts` using `createBdd(test)` with `test` from `src/fixtures/testFixture.ts`.
8. Run `npm run bddgen` to regenerate `.features-gen/` before running the scenario.

## Example

Use [example-ui-code.md](example-ui-code.md) as the canonical reference contract for UI generation in this repository. It shows the expected page-object, component, fixture, validator, data-model, feature, and step-definition structure for a login flow that matches the current framework conventions.

The example contract maps to the repository layout below:

- `src/pages/LoginPage.ts`
- `src/components/TextBox.ts`
- `src/components/Button.ts`
- `src/locators/LoginPageLocators.ts`
- `src/fixtures/testFixture.ts`
- `src/validators/LoginValidator.ts`
- `src/data/models/AuthenticationData.ts`
- `features/ui/authentication/login.feature`
- `src/bdd/steps/ui/authentication/login.steps.ts`

## Prompt instructions for Copilot

When generating a new UI scenario or page object, follow this structure:

- Determine the target user flow and test scenario.
- Keep test data separate from test logic — and out of `.feature` step text for anything secret or credential-shaped.
- Generate page objects first, then use them inside `src/bdd/steps/ui/**/*.steps.ts`.
- Use readable Gherkin step text and single-responsibility step functions.
- Keep the generated code aligned with the file locations above.
- Use [example-ui-code.md](example-ui-code.md) as the concrete shape reference when the generated flow needs a full implementation pattern.
- If this file is missing or renamed in another project, do not fail the prompt. Discover the relevant `*ui*guidelines*.md` document under `src/ai/` or fall back to the stable repository conventions in `features/ui/`, `src/bdd/steps/ui/`, `src/pages/`, and `src/components/`.
- After generating or editing a `.feature` file or step definitions, run `npm run bddgen` (regenerates `.features-gen/`) and `npm run typecheck` before reporting done.

---

Use the relevant guideline file in `src/ai/` as the canonical source for new UI automation generation in this repository.
