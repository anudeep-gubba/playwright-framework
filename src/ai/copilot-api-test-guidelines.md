# Copilot API Test Generation Guidelines

This prompt file describes the accepted standards for generating API automation in this Playwright framework.

## Purpose

Use these guidelines when generating new API tests, service classes, request/response models, and test data files.

## File locations

- API test files: `tests/api/*.spec.ts`
- API client and fixtures: `src/api/fixtures/*.ts`
- API engine/core client: `src/api/client/*.ts`
- API services: `src/api/services/*.ts`
- Request payload models: `src/api/requests/*.ts`
- Response models: `src/api/responses/*.ts`
- Shared API utilities: `src/api/*` and `src/utils/*`
- Test data models: `src/data/models/*.ts`
- Test data sets: `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`

## Standards for API test generation

1. Use a service-based API layer.
   - Define reusable service classes in `src/api/services/*`.
   - Encapsulate HTTP method details in `src/api/client/ApiEngine.ts`.
   - Keep request logic separate from tests.
   - Never bypass the service layer by calling `request.newContext()` or raw `APIRequestContext` methods directly inside API tests.

2. Keep API tests declarative.
   - Create tests under `tests/api/` with clear `test.describe` structure.
   - Use service methods like `api.service("auth").login(...)` and `api.service("event").createEvent(...)`.
   - Keep assertions in tests and business logic in service or helper classes.
   - Use the shared fixture and `api` object from `src/api/fixtures/apiTest.ts` for setup, auth, and scenario context.

3. Use typed request and response models.
   - Define request payloads in `src/api/requests/*.ts`.
   - Define response shapes in `src/api/responses/*.ts`.
   - Use these types in services and tests for type safety.

### Hard rules / anti-patterns

- Do not create new API tests as `.spec.js`; this repository standard is `tests/api/*.spec.ts`.
- Do not hand-write endpoint URLs or HTTP headers in tests when a service method already exists.
- If a flow needs `create`, `update`, or `delete`, extend the service class first, then call the new method from the test.
- Store reusable auth and resource values in `api.setContextValue(...)` and retrieve them with `api.getContextValue(...)` instead of local variables that are not shared across steps.
- Centralize payload templates in test data files and load them with `TestData.load<T>("filename")` rather than embedding ad-hoc JSON directly in the test.

4. Use centralized test data.
   - Store API payload templates in `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`.
   - Load data with `TestData.load<T>("filename")`.
   - Map payloads to typed models where possible.

5. Handle auth and shared state in fixtures.
   - Use `src/api/fixtures/apiFixture.ts` and `src/api/fixtures/apiTest.ts` for setup.
   - Keep API token storage in `src/api/auth/TokenManager.ts`.
   - Do not mix API auth state with UI fixtures.

6. Keep API and UI separate.
   - API tests go in `tests/api`; UI tests go in `tests/ui`.
   - Do not import UI page objects into API tests.
   - Do not import API service classes into UI tests unless explicitly building hybrid flow support.

7. Logging and reporting.
   - Use `src/utils/Logger.ts` for API-level logging.
   - Add request/response attachments to Playwright test report when available.
   - Avoid printing verbose logs in normal test output unless debugging.

## What to generate when adding a new API flow

1. Add request and response models for the new endpoint.
2. Add a new service method in `src/api/services/<ServiceName>Service.ts`.
3. Add or update test data in `src/data/datasets/json/*.json` or `src/data/datasets/yaml/*.yaml`.
4. Implement a new test in `tests/api/<feature>.spec.ts`.
5. Use the existing API fixture to keep test setup and auth handling consistent.

## Example

For a login + event creation flow:

- `src/api/requests/LoginRequest.ts`
- `src/api/responses/LoginResponse.ts`
- `src/api/services/AuthenticationService.ts`
- `src/api/services/EventService.ts`
- `src/api/fixtures/apiFixture.ts`
- `src/data/models/AuthenticationData.ts`
- `src/data/datasets/json/authentication.json`
- `tests/api/login.spec.ts`

## Prompt instructions for Copilot

When generating a new API test or service class, follow this structure:

- Determine the API endpoint and the scenario to validate.
- Create request/response models first.
- Create or extend service methods to represent endpoint behavior.
- Keep tests readable and data-driven.
- Use existing fixtures for setup and token management.
- Keep API generation aligned with the file locations above.

---

Use this file as the canonical guideline for new API automation generation in this repository.
