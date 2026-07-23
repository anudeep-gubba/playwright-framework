import { getFutureDateIso } from "../../src/utils/DateUtils";
import { test, expect } from "../../src/api/fixtures/apiTest";
import { TestData } from "../../src/data";
import { AuthenticationData } from "../../src/data/models/AuthenticationData";

const authentication = TestData.load<AuthenticationData>("authentication");

test.describe("API :: Authentication", () => {  test("Login API should return success and token", async ({ api }) => {
    const user = authentication.apiLogin.validUser;

    const response = await api.service("auth").login({
      email: user.email,
      password: user.password,
    });
    expect(response.success).toBe(true);    expect(response.token).toBeTruthy();    expect(response.user.id).toBeGreaterThan(0);    expect(response.user.email).toBe(user.email);

    api.setContextValue("authToken", response.token);
  });
  test("Create event API should use login token and return created event", async ({ api }) => {
    const user = authentication.apiLogin.validUser;
    const eventRequest = {
      ...authentication.apiEvent.createEvent,
      eventDate: getFutureDateIso(1, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
    };

    const loginResponse = await api.service("auth").login({
      email: user.email,
      password: user.password,
    });

    api.setContextValue("authToken", loginResponse.token);

    const eventResponse = await api.service("event").createEvent(eventRequest);
    expect(eventResponse.success).toBe(true);    expect(eventResponse.message).toContain("Event created successfully");    expect(eventResponse.data.id).toBeGreaterThan(0);    expect(eventResponse.data.title).toBe(eventRequest.title);    expect(eventResponse.data.city).toBe(eventRequest.city);    expect(Number(eventResponse.data.price)).toBe(eventRequest.price);

    api.setContextValue("eventId", eventResponse.data.id);
  });
});
