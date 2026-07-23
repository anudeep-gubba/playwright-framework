import { User, RegistrationUser } from "../../models";

export interface AuthenticationData {
  login: {
    validUser: User;
    invalidPassword: User;
    invalidEmail: User;
    emptyEmail: User;
    emptyPassword: User;
  };

  apiLogin: {
    validUser: User;
  };

  apiEvent: {
    createEvent: {
      title: string;
      description: string;
      category: string;
      venue: string;
      city: string;
      eventDate: string;
      price: number;
      totalSeats: number;
      imageUrl: string;
    };
  };

  registration: {
    validUser: RegistrationUser;
    existingUser: RegistrationUser;
    invalidEmail: RegistrationUser;
  };
}
