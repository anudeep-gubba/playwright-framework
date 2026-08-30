---
name: create-api-test
description: Generate a new API test flow (request/response models, endpoint constants, service method, test data, spec) following this framework's service-based API layer conventions
trigger: /create-api-test
---

# /create-api-test

Scaffold a new API test flow for this Playwright framework, following the service-based architecture: `tests/api/*.spec.ts` → `src/api/fixtures/apiTest.ts` → `src/api/ApiFacade.ts` → `src/api/services/*.ts` → `src/api/client/ApiEngine.ts`.

## Before generating anything

1. Read `src/ai/copilot-api-test-guidelines.md` — the canonical contract for API generation in this repository. If it has moved or been renamed, discover the current `*api*guidelines*.md` file under `src/ai/` instead of failing.
2. Read `src/ai/example-api-code.md` — the concrete shape reference (request/response models, service class, dataset, spec) to match structure and style against.
3. If the user hasn't specified the endpoint, method, payload shape, and success/failure scenarios to cover, ask before generating.

## File locations

- API test files: `tests/api/*.spec.ts`
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
2. Endpoint constant added to `src/constants/APIEndpoints.ts` (never hardcode endpoint strings in a test).
3. A new or extended service method in `src/api/services/<ServiceName>Service.ts`, registered in `src/api/services/index.ts`.
4. Test data added to `src/data/datasets/{json,yaml,csv,excel}/apiData.*` (every supported format), typed in `src/data/models/ApiData.ts`.
5. A test in `tests/api/<feature>.spec.ts` using `src/api/fixtures/apiTest.ts`.

## Hard rules / anti-patterns

- Never call `request.newContext()` or raw `APIRequestContext` methods directly inside a test — everything goes through `api.service("<name>")`.
- Do not hand-write endpoint URLs or headers in tests when a service method already exists; extend the service first.
- Store values shared across steps (auth token, created resource id) via `api.setContextValue(...)` / `api.getContextValue(...)` — not local variables.
- Load payloads with `await TestData.load<T>("apiData")` inside a `test.beforeAll` (it's async) rather than embedding ad-hoc JSON in the test.
- Never put a real credential value in `src/data/datasets/*` — reference it as `{{key}}` (e.g. `"{{apiValidUserPassword}}"`) and add the real value to `config/secrets/<env>.env` (gitignored; see `config/secrets/*.env.example`). See `resolveSecrets()` in `src/data/utils/resolveSecrets.ts`.
- Keep API token storage in `src/api/auth/TokenManager.ts`; don't mix API auth state with UI fixtures.
- Do not import UI page objects into API tests.
- Use `src/utils/Logger.ts` for API-level logging, not `console.log`.

## Process

1. Confirm the endpoint, HTTP method, payload/response shape, and scenarios (success + failure paths) to cover.
2. Add typed request/response models.
3. Add/update the endpoint constant.
4. Add or extend the service method.
5. Add test data (JSON, YAML, CSV, and Excel) and update the data model if new fields are introduced.
6. Write the spec in `tests/api/<feature>.spec.ts`, tagging smoke-critical tests per `TestTags`.
7. Run `npm run typecheck` and the new spec (`npx playwright test tests/api/<feature>.spec.ts`) to confirm it passes before reporting done.
