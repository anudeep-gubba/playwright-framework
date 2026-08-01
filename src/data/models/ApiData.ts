import { User } from "../../models";
import { CreateEventRequest } from "../../api/requests/EventRequest";

export interface ApiData {
  login: {
    validUser: User;
  };

  event: {
    createEvent: CreateEventRequest;
    updateEvent: CreateEventRequest;
  };
}
