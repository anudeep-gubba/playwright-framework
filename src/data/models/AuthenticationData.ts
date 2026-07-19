import { User, RegistrationUser } from "../../models";

export interface AuthenticationData {
  login: {
    validUser: User;
    invalidPassword: User;
    invalidEmail: User;
    emptyEmail: User;
    emptyPassword: User;
  };

  registration: {
    validUser: RegistrationUser;
    existingUser: RegistrationUser;
    invalidEmail: RegistrationUser;
  };
}
