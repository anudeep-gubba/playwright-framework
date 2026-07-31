# Copilot UI Test Generation Guidelines

This prompt file describes the accepted standards for generating UI automation in this Playwright framework.

## Purpose

Use these guidelines when generating new UI tests, page objects, component wrappers, and test data files.

## File locations

- UI test files: `tests/ui/*.spec.ts`
- Page objects: `src/pages/*.ts`
- Reusable page components: `src/components/*`
- Test fixtures: `src/fixtures/testFixture.ts`
- Shared domain/models: `src/models/*.ts`
- Shared route and app constants: `src/constants/*.ts`
- Validators and UI expectations: `src/validators/*.ts`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`
- Locators: `src/locators/*` or inside page object classes when locator-specific files are not needed
- Helpers / utils: `src/utils/*`

## Standards for UI test generation

1. Use the Page Object Model.
   - Place high-level page actions in `src/pages/*`.
   - Keep selector logic in page objects or dedicated locator files.
   - Do not place test assertions or business rules in page object methods.

2. Keep UI tests simple and readable.
   - Create tests under `tests/ui/` with `test.describe`, `test.beforeEach`, and plain `expect` assertions.
   - Use the shared fixture from `src/fixtures/testFixture.ts`.
   - Keep navigation routes and app constants centralized in `src/constants/*.ts`.
   - Each test should verify one application behavior or scenario.

3. Use reusable components.
   - Common controls such as buttons, text fields, checkboxes, and labels belong under `src/components/`.
   - Import `src/components` into page objects when building reusable UI actions.

4. Use centralized test data.
   - Store static test data in `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`.
   - Define type-safe data shapes in `src/data/models/*.ts`.
   - Reuse shared domain types from `src/models/*.ts` when the page object needs request payload contracts.
   - Load data with `TestData.load<T>("filename")`.

5. Naming conventions.
   - Page object files: `LoginPage.ts`, `RegistrationPage.ts`, etc.
   - Test files: `login.spec.ts`, `registration.spec.ts`, etc.
   - Component files: `Button.ts`, `TextBox.ts`, `CheckBox.ts`, `Label.ts`.

6. Keep API and UI separate.
   - Do not add API test logic or token handling to `tests/ui`.
   - API flows belong in `tests/api` and `src/api`.

7. Logging and reporting.
   - If a UI helper needs logging, use `src/utils/Logger.ts`.
   - Keep reusable assertion helpers in `src/validators/*.ts` instead of embedding validation logic in page objects or test files.
   - Do not generate console output from tests unless it aids debugging.

## What to generate when adding a new UI flow

1. Create page classes for each page involved in the scenario.
2. Add or update component wrappers in `src/components` if reusable elements are needed.
3. Add or update shared constants in `src/constants/*.ts` for routes or app-level values.
4. Add test data to `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml` and corresponding models in `src/data/models/*.ts`.
5. Add or update validators in `src/validators/*.ts` when assertions are reused across scenarios.
6. Implement the scenario in `tests/ui/<feature>.spec.ts`.
7. Use the fixture from `src/fixtures/testFixture.ts` to access page instances and environment setup.

## Example

Use [example-ui-code.md](example-ui-code.md) as the canonical reference contract for UI generation in this repository. It shows the expected page-object, component, fixture, validator, and data-model structure for a login flow that matches the current framework conventions.

The example contract maps to the repository layout below:

- `src/pages/LoginPage.ts`
- `src/components/TextBox.ts`
- `src/components/Button.ts`
- `src/locators/LoginPageLocators.ts`
- `src/fixtures/testFixture.ts`
- `src/validators/LoginValidator.ts`
- `src/data/models/AuthenticationData.ts`
- `tests/ui/login.spec.ts`

## Prompt instructions for Copilot

When generating a new UI test or page object, follow this structure:

- Determine the target user flow and test scenario.
- Keep test data separate from test logic.
- Generate page objects first, then use them inside `tests/ui/*.spec.ts`.
- Use readable names and single-responsibility methods.
- Keep the generated code aligned with the file locations above.
- Use [example-ui-code.md](example-ui-code.md) as the concrete shape reference when the generated flow needs a full implementation pattern.
- If this file is missing or renamed in another project, do not fail the prompt. Discover the relevant `*ui*guidelines*.md` document under `src/ai/` or fall back to the stable repository conventions in `tests/ui/`, `src/pages/`, and `src/components/`.

---

Use the relevant guideline file in `src/ai/` as the canonical source for new UI automation generation in this repository.
