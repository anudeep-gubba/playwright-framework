import { User, PaymentDetails } from "../../models";

export interface UiData {
  login: {
    validUser: User;
    invalidPassword: User;
    invalidEmail: User;
  };

  checkout: {
    productName: string;
    payment: PaymentDetails;
  };
}
