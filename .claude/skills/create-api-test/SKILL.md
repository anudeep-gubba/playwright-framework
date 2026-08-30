---
name: create-api-test
description: Generate a new API test flow (request/response models, endpoint constants, service method, test data, Gherkin feature, step definitions) following this framework's BDD + service-based API layer conventions
trigger: /create-api-test
---

# /create-api-test

Scaffold a new API test flow for this Playwright framework, written BDD-style: `features/api/*.feature` (Gherkin) → `src/bdd/steps/api/*.steps.ts` (`createBdd(test)` step definitions) → `src/api/fixtures/apiTest.ts` → `src/api/ApiFacade.ts` → `src/api/services/*.ts` → `src/api/client/ApiEngine.ts`. `playwright-bdd` generates a native Playwright spec per scenario into `.features-gen/api/` (gitignored) via `npm run bddgen`.

## Before generating anything

1. Read `src/ai/copilot-api-test-guidelines.md` — the canonical contract for API generation in this repository. If it has moved or been renamed, discover the current `*api*guidelines*.md` file under `src/ai/` instead of failing.
2. Read `src/ai/example-api-code.md` — the concrete shape reference (request/response models, service class, dataset, feature file, step definitions) to match structure and style against.
3. If the user hasn't specified the endpoint, method, payload shape, and success/failure scenarios to cover, ask before generating.

## File locations

- API feature files: `features/api/*.feature`
- API step definitions: `src/bdd/steps/api/*.steps.ts` (extend `test` from `src/api/fixtures/apiTest.ts` via `createBdd(test)`)
- API client and fixtures: `src/api/fixtures/*.ts`
- API engine/core client: `src/api/client/*.ts`
- API services: `src/api/services/*.ts`
- Request payload models: `src/api/requests/*.ts`
- Response models: `src/api/responses/*.ts`
- Endpoint constants: `src/constants/APIEndpoints.ts`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/{json,yaml,csv,excel}/*` (same logical dataset in every supported format). JSON/YAML hold the nested structure directly; CSV/Excel use flat `key,value,type` rows (dot-path `key`, optional `type` of `string`|`number`|`boolean`, default `string` — set it explicitly for numeric fields).

## What to generate for a new API flow

1. Request/response models for the new endpoint in `src/api/requests/` / `src/api/responses/`.
2. Endpoint constant added to `src/constants/APIEndpoints.ts` (never hardcode endpoint strings in a step definition).
3. A new or extended service method in `src/api/services/<ServiceName>Service.ts`, registered in `src/api/services/index.ts`.
4. Test data added to `src/data/datasets/{json,yaml,csv,excel}/apiData.*` (every supported format), typed in `src/data/models/ApiData.ts`.
5. A feature file in `features/api/<feature>.feature` — `Given`/`When`/`Then`, tagged `@api` on the `Feature:` plus `@smoke`/`@regression` on the relevant `Scenario:` lines. Use `Scenario Outline` + `Examples` (named with the column placeholder) instead of near-duplicate `Scenario`s that only differ by one data value — see `features/ui/authentication/login.feature` for the pattern.
6. Step definitions in `src/bdd/steps/api/<feature>.steps.ts` using `createBdd(test)` with `test` from `src/api/fixtures/apiTest.ts`.

## Hard rules / anti-patterns

- Never call `request.newContext()` or raw `APIRequestContext` methods directly inside a step definition — everything goes through `api.service("<name>")`.
- Do not hand-write endpoint URLs or headers in step definitions when a service method already exists; extend the service first.
- Store values shared across steps (auth token, created resource id) via `api.setContextValue(...)` / `api.getContextValue(...)` — not module-scoped variables.
- Load payloads with `await TestData.load<T>("apiData")` inside a `BeforeAll({ tags: "@api" }, async () => {...})` hook (from `createBdd(test)`) rather than embedding ad-hoc JSON in a step definition. Scope every `BeforeAll`/`AfterAll` with `{ tags: "@api" }` — an unscoped hook applies to every generated feature file (including UI's), which breaks `bddgen`'s per-scenario fixture guessing ("Found 2 test instances...").
- Never put a real credential value in `src/data/datasets/*` — reference it as `{{key}}` (e.g. `"{{apiValidUserPassword}}"`) and add the real value to `config/secrets/<env>.env` (gitignored; see `config/secrets/*.env.example`). See `resolveSecrets()` in `src/data/utils/resolveSecrets.ts`. Never pass a literal credential value through `.feature` step text either — pass a named key and resolve it from the loaded dataset inside the step definition.
- Keep API token storage in `src/api/auth/TokenManager.ts`; don't mix API auth state with UI fixtures.
- Do not import UI page objects into API step definitions.
- Use `src/utils/Logger.ts` for API-level logging, not `console.log`.
- `test as base` in `src/api/fixtures/apiTest.ts` must be imported from `"playwright-bdd"`, not `"@playwright/test"` — `createBdd()` requires it.

## Process

1. Confirm the endpoint, HTTP method, payload/response shape, and scenarios (success + failure paths) to cover.
2. Add typed request/response models.
3. Add/update the endpoint constant.
4. Add or extend the service method.
5. Add test data (JSON, YAML, CSV, and Excel) and update the data model if new fields are introduced.
6. Write the feature file in `features/api/<feature>.feature`, tagging smoke-critical scenarios per `TestTags` conventions (`@smoke`, `@regression`).
7. Implement the step definitions in `src/bdd/steps/api/<feature>.steps.ts`.
8. Run `npm run bddgen` to generate `.features-gen/`, then `npm run typecheck` and the new scenario (`npx playwright test .features-gen/api/<feature>.feature.spec.js`) to confirm it passes before reporting done.
