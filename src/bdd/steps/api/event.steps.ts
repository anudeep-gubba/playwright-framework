import { createBdd } from "playwright-bdd";

import { test, expect } from "../../../api/fixtures/apiTest";
import { TestData } from "../../../data";
import { ApiData } from "../../../data/models/ApiData";
import { getFutureDateIso } from "../../../utils/DateUtils";
import { CreateEventRequest } from "../../../api/requests/EventRequest";
import { EventResponse } from "../../../api/responses/EventResponse";
import { LoginResponse } from "../../../api/responses/LoginResponse";

const { Given, When, Then, BeforeAll } = createBdd(test);

let apiData: ApiData;

// Tag-scoped so this hook — and the customTest it's bound to — only applies to @api
// scenarios; an unscoped BeforeAll runs for every generated feature file regardless
// of tags, which confuses bddgen's per-feature test-instance guessing across layers.
BeforeAll({ tags: "@api" }, async () => {
  apiData = await TestData.load<ApiData>("apiData");
});

function buildEventPayload(base: CreateEventRequest): CreateEventRequest {
  return {
    ...base,
    eventDate: getFutureDateIso(2, {
      hours: 9,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }),
  };
}

Given("I log in via the API with valid credentials", async ({ api }) => {
  const user = apiData.login.validUser;

  const loginResponse = await api.service("auth").login({
    email: user.email,
    password: user.password,
  });

  api.setContextValue("loginResponse", loginResponse);
});

Then("the login should succeed and return an auth token", async ({ api }) => {
  const loginResponse = api.getContextValue<LoginResponse>("loginResponse");

  expect(loginResponse.success).toBe(true);
  expect(loginResponse.token).toBeTruthy();

  api.setContextValue("authToken", loginResponse.token);
});

When("I create an event", async ({ api }) => {
  const createEventPayload = buildEventPayload(apiData.event.createEvent);

  api.setContextValue("createEventPayload", createEventPayload);

  const createEventResponse = await api.service("event").createEvent(createEventPayload);

  api.setContextValue("createEventResponse", createEventResponse);
  api.setContextValue("eventId", createEventResponse.data.id);
});

Then("the event should be created successfully", async ({ api }) => {
  const createEventPayload = api.getContextValue<CreateEventRequest>("createEventPayload");
  const createEventResponse = api.getContextValue<EventResponse>("createEventResponse");

  expect(createEventResponse.success).toBe(true);
  expect(createEventResponse.message).toContain("Event created successfully");
  expect(createEventResponse.data.id).toBeGreaterThan(0);
  expect(createEventResponse.data.title).toBe(createEventPayload.title);
  expect(createEventResponse.data.city).toBe(createEventPayload.city);
  expect(Number(createEventResponse.data.price)).toBe(createEventPayload.price);
});

When("I update the event", async ({ api }) => {
  const eventId = api.getContextValue<number>("eventId");
  const updateEventPayload = buildEventPayload(apiData.event.updateEvent);

  api.setContextValue("updateEventPayload", updateEventPayload);

  const updateEventResponse = await api.service("event").updateEvent(eventId, updateEventPayload);

  api.setContextValue("updateEventResponse", updateEventResponse);
});

Then("the event should be updated successfully", async ({ api }) => {
  const eventId = api.getContextValue<number>("eventId");
  const updateEventPayload = api.getContextValue<CreateEventRequest>("updateEventPayload");
  const updateEventResponse = api.getContextValue<EventResponse>("updateEventResponse");

  expect(updateEventResponse.success).toBe(true);
  expect(updateEventResponse.message).toContain("Event updated successfully");
  expect(updateEventResponse.data.id).toBe(eventId);
  expect(updateEventResponse.data.title).toBe(updateEventPayload.title);
  expect(updateEventResponse.data.city).toBe(updateEventPayload.city);
});

When("I delete the event", async ({ api }) => {
  const eventId = api.getContextValue<number>("eventId");

  const deleteEventResponse = await api.service("event").deleteEvent(eventId);

  api.setContextValue("deleteEventResponse", deleteEventResponse);
});

Then("the event should be deleted successfully", async ({ api }) => {
  const deleteEventResponse = api.getContextValue<EventResponse>("deleteEventResponse");

  expect(deleteEventResponse.success).toBe(true);
  expect(deleteEventResponse.message).toContain("Event deleted successfully");
});
