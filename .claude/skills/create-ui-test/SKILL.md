---
name: create-ui-test
description: Generate a new UI test flow (page object, components, locators, validator, test data, spec) following this framework's Page Object Model conventions
trigger: /create-ui-test
---

# /create-ui-test

Scaffold a new UI test flow for this Playwright framework, following the Page Object Model architecture: `tests/<feature>/*.spec.ts` → `src/fixtures/testFixture.ts` → `src/pages/*.ts` (extends `BasePage`) → `src/components/*` (extends `BaseComponent`) → `src/locators/*.ts`.

## Before generating anything

1. Read `src/ai/copilot-ui-test-guidelines.md` — the canonical contract for UI generation in this repository. If it has moved or been renamed, discover the current `*ui*guidelines*.md` file under `src/ai/` instead of failing.
2. Read `src/ai/example-ui-code.md` — the concrete shape reference (page object, component, locators, fixture, validator, data model, spec) to match structure and style against.
3. If the user hasn't specified the target user flow, pages involved, and scenarios (positive + negative) to cover, ask before generating.

## File locations

- UI test files: `tests/<feature>/*.spec.ts`
- Page objects: `src/pages/*.ts` (extend `BasePage`)
- Reusable page components: `src/components/*` (extend `BaseComponent`, wrap a `Locator`)
- Locators: `src/locators/*.ts`
- Test fixtures: `src/fixtures/testFixture.ts`
- Validators (assertions live here, not in page objects/specs): `src/validators/*.ts`
- Shared domain models: `src/models/*.ts`
- Shared route/app constants: `src/constants/*.ts`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/json/*.json` **and** `src/data/datasets/yaml/*.yaml` (same logical dataset in both)

## What to generate for a new UI flow

1. Page object(s) in `src/pages/` for each page involved in the scenario, extending `BasePage`.
2. Component wrappers in `src/components/` if new reusable elements are needed (extend `BaseComponent`).
3. Locators in `src/locators/<Page>Locators.ts`, referenced by the page object — never raw `page.locator()` calls scattered in tests.
4. Routes/constants added to `src/constants/AppRoutes.ts` (or other `src/constants/*.ts`) as needed.
5. Test data added to `src/data/datasets/json/uiData.json` **and** `src/data/datasets/yaml/uiData.yaml`, typed in `src/data/models/UiData.ts`.
6. Validator methods in `src/validators/<Feature>Validator.ts` for assertions reused across scenarios.
7. A spec in `tests/<feature>/<feature>.spec.ts` using `src/fixtures/testFixture.ts`.

## Hard rules / anti-patterns

- Page objects must not contain `expect(...)` assertions or business rules — those belong in `src/validators/*.ts`.
- Build UI actions from `src/components/*` wrappers rather than raw `page.locator()` calls in page objects.
- Wrap logical UI actions in `AllureHelper.step(name, fn)` for step-level reporting (see `LoginPage.login`).
- Load test data with `TestData.load<T>("uiData")` rather than hardcoding credentials/values in the spec.
- Do not import API service classes into UI tests/page objects.
- Keep each test focused on one application behavior or scenario.
- Use `src/utils/Logger.ts` for any UI helper logging, not `console.log`.

## Process

1. Confirm the target flow, pages involved, and scenarios (success + failure paths) to cover.
2. Add/update locators, then the page object(s) built on top of them.
3. Add component wrappers only if the flow needs controls not already covered by `src/components/*`.
4. Add test data (JSON + YAML) and update the data model if new fields are introduced.
5. Add/extend a validator for the scenario's expected outcomes.
6. Write the spec in `tests/<feature>/<feature>.spec.ts`, tagging smoke-critical tests per `TestTags`.
7. Run `npm run typecheck` and the new spec (`npx playwright test tests/<feature>/<feature>.spec.ts`) to confirm it passes before reporting done.
