---
name: create-ui-test
description: Generate a new UI test flow (page object, components, locators, validator, test data, Gherkin feature, step definitions) following this framework's BDD + Page Object Model conventions
trigger: /create-ui-test
---

# /create-ui-test

Scaffold a new UI test flow for this Playwright framework, written BDD-style: `features/ui/<feature>/*.feature` (Gherkin) → `src/bdd/steps/ui/<feature>/*.steps.ts` (`createBdd(test)` step definitions) → `src/fixtures/testFixture.ts` → `src/pages/*.ts` (extends `BasePage`) → `src/components/*` (extends `BaseComponent`) → `src/locators/*.ts`. `playwright-bdd` generates a native Playwright spec per scenario into `.features-gen/ui/` (gitignored) via `npm run bddgen`.

## Before generating anything

1. Read `src/ai/copilot-ui-test-guidelines.md` — the canonical contract for UI generation in this repository. If it has moved or been renamed, discover the current `*ui*guidelines*.md` file under `src/ai/` instead of failing.
2. Read `src/ai/example-ui-code.md` — the concrete shape reference (page object, component, locators, fixture, validator, data model, feature file, step definitions) to match structure and style against.
3. If the user hasn't specified the target user flow, pages involved, and scenarios (positive + negative) to cover, ask before generating.

## File locations

- UI feature files: `features/ui/<feature>/*.feature`
- UI step definitions: `src/bdd/steps/ui/<feature>/*.steps.ts` (extend `test` from `src/fixtures/testFixture.ts` via `createBdd(test)`)
- Page objects: `src/pages/*.ts` (extend `BasePage`)
- Reusable page components: `src/components/*` (extend `BaseComponent`, wrap a `Locator`)
- Locators: `src/locators/*.ts`
- Test fixtures: `src/fixtures/testFixture.ts`
- Validators (assertions live here, not in page objects/step definitions): `src/validators/*.ts`
- Shared domain models: `src/models/*.ts`
- Shared route/app constants: `src/constants/*.ts`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/{json,yaml,csv,excel}/*` (same logical dataset in every supported format). JSON/YAML hold the nested structure directly; CSV/Excel use flat `key,value,type` rows (dot-path `key`, optional `type` of `string`|`number`|`boolean`, default `string`).

## What to generate for a new UI flow

1. Page object(s) in `src/pages/` for each page involved in the scenario, extending `BasePage`.
2. Component wrappers in `src/components/` if new reusable elements are needed (extend `BaseComponent`).
3. Locators in `src/locators/<Page>Locators.ts`, referenced by the page object — never raw `page.locator()` calls scattered in step definitions.
4. Routes/constants added to `src/constants/AppRoutes.ts` (or other `src/constants/*.ts`) as needed.
5. Test data added to `src/data/datasets/{json,yaml,csv,excel}/uiData.*` (every supported format), typed in `src/data/models/UiData.ts`.
6. Validator methods in `src/validators/<Feature>Validator.ts` for assertions reused across scenarios.
7. A feature file in `features/ui/<feature>/<feature>.feature` — `Given`/`When`/`Then`, tagged `@ui` on the `Feature:` plus `@smoke`/`@regression`/`@negative` on the relevant `Scenario:` lines. Use `Scenario Outline` + `Examples` (named with the column placeholder, e.g. `Invalid <credentialKey> should...`) instead of near-duplicate `Scenario`s that only differ by one data value — see `features/ui/authentication/login.feature`.
8. Step definitions in `src/bdd/steps/ui/<feature>/<feature>.steps.ts` using `createBdd(test)` with `test` from `src/fixtures/testFixture.ts`.

## Hard rules / anti-patterns

- Page objects must not contain `expect(...)` assertions or business rules — those belong in `src/validators/*.ts`, called from `Then` steps.
- Build UI actions from `src/components/*` wrappers rather than raw `page.locator()` calls in page objects.
- Wrap logical UI actions in `AllureHelper.step(name, fn)` for step-level reporting (see `LoginPage.login`).
- Load test data with `await TestData.load<T>("uiData")` inside a `BeforeAll({ tags: "@ui" }, async () => {...})` hook (from `createBdd(test)`) rather than hardcoding credentials/values. Scope every `BeforeAll`/`AfterAll` with `{ tags: "@ui" }` — an unscoped hook applies to every generated feature file (including API's), which breaks `bddgen`'s per-scenario fixture guessing ("Found 2 test instances...").
- Never put a real credential value in `src/data/datasets/*` — reference it as `{{key}}` (e.g. `"{{uiValidUserPassword}}"`) and add the real value to `config/secrets/<env>.env` (gitignored; see `config/secrets/*.env.example`). See `resolveSecrets()` in `src/data/utils/resolveSecrets.ts`. Never pass a literal credential value (real or deliberately-wrong) through `.feature` step text either — pass a named key (e.g. `the "validUser" credentials`) and resolve it from the loaded dataset inside the step definition.
- Do not import API service classes into UI step definitions/page objects.
- Keep each scenario focused on one application behavior.
- Use `src/utils/Logger.ts` for any UI helper logging, not `console.log`.
- `test as base` in `src/fixtures/testFixture.ts` must be imported from `"playwright-bdd"`, not `"@playwright/test"` — `createBdd()` requires it.

## Process

1. Confirm the target flow, pages involved, and scenarios (success + failure paths) to cover.
2. Add/update locators, then the page object(s) built on top of them.
3. Add component wrappers only if the flow needs controls not already covered by `src/components/*`.
4. Add test data (JSON, YAML, CSV, and Excel) and update the data model if new fields are introduced.
5. Add/extend a validator for the scenario's expected outcomes.
6. Write the feature file in `features/ui/<feature>/<feature>.feature`, tagging smoke-critical scenarios per `TestTags` conventions (`@smoke`, `@regression`, `@negative`).
7. Implement the step definitions in `src/bdd/steps/ui/<feature>/<feature>.steps.ts`.
8. Run `npm run bddgen` to generate `.features-gen/`, then `npm run typecheck` and the new scenario (`npx playwright test .features-gen/ui/<feature>/<feature>.feature.spec.js`) to confirm it passes before reporting done.
