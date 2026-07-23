import { getFutureDateIso } from "../../src/utils/DateUtils";
import { test, expect } from "../../src/api/fixtures/apiTest";
import { TestData } from "../../src/data";
import { AuthenticationData } from "../../src/data/models/AuthenticationData";
import { EventData } from "../../src/data/models/EventData";

const authentication = TestData.load<AuthenticationData>("authentication");
const eventData = TestData.load<EventData>("event");

test.describe("API :: Event CRUD", () => {
  test("should login, create, update and delete an event via API", async ({
    api,
  }) => {
    const user = authentication.apiLogin.validUser;
    const createEventPayload = {
      ...eventData.createEvent,
      eventDate: getFutureDateIso(2, {
        hours: 9,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }),
    };

    const updateEventPayload = {
      ...eventData.updateEvent,
      eventDate: getFutureDateIso(2, {
        hours: 9,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }),
    };

    const loginResponse = await api.service("auth").login({
      email: user.email,
      password: user.password,
    });

    expect(loginResponse.success).toBe(true);
    expect(loginResponse.token).toBeTruthy();

    api.setContextValue("authToken", loginResponse.token);

    const createEventResponse = await api
      .service("event")
      .createEvent(createEventPayload);

    expect(createEventResponse.success).toBe(true);
    expect(createEventResponse.message).toContain("Event created successfully");
    expect(createEventResponse.data.id).toBeGreaterThan(0);
    expect(createEventResponse.data.title).toBe(createEventPayload.title);
    expect(createEventResponse.data.city).toBe(createEventPayload.city);
    expect(Number(createEventResponse.data.price)).toBe(
      createEventPayload.price,
    );

    api.setContextValue("eventId", createEventResponse.data.id);

    const eventId = api.getContextValue<number>("eventId");

    const updateEventResponse = await api
      .service("event")
      .updateEvent(eventId, updateEventPayload);

    expect(updateEventResponse.success).toBe(true);
    expect(updateEventResponse.message).toContain("Event updated successfully");
    expect(updateEventResponse.data.id).toBe(eventId);
    expect(updateEventResponse.data.title).toBe(updateEventPayload.title);
    expect(updateEventResponse.data.city).toBe(updateEventPayload.city);

    const deleteEventResponse = await api.service("event").deleteEvent(eventId);

    expect(deleteEventResponse.success).toBe(true);
    expect(deleteEventResponse.message).toContain("Event deleted successfully");
  });
});
