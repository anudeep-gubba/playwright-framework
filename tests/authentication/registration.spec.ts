// import { test } from "../../src/fixtures/testfixture";

// import { authentication } from "../../src/data/datasets";

// import { RegistrationValidator } from "../../src/validators/RegistrationValidator";

// test.describe("Authentication :: Registration", () => {
//   test.describe("Positive Scenarios", () => {
//     test("New user should register successfully", async ({
//       registrationPage,
//     }) => {
//       const user = structuredClone(authentication.registration.newUser);

//       await registrationPage.navigate();

//       await registrationPage.register(user);

//       // RegistrationValidator.expectRegistrationSuccess(
//       //     await registrationPage.getSuccessMessage()
//       // );
//     });
//   });

//   test.describe("Negative Scenarios", () => {
//     test("Empty first name", async ({ registrationPage }) => {
//       const user = structuredClone(authentication.registration.emptyFirstName);

//       await registrationPage.navigate();

//       await registrationPage.register(user);

//       // RegistrationValidator.expectFirstNameRequired(
//       //   await registrationPage.getErrorMessage(),
//       // );
//     });

//     test("Empty last name", async ({ registrationPage }) => {
//       const user = structuredClone(authentication.registration.emptyLastName);

//       await registrationPage.navigate();

//       await registrationPage.register(user);

//       // RegistrationValidator.expectLastNameRequired(
//       //   await registrationPage.getErrorMessage(),
//       // );
//     });

//     test("Empty email", async ({ registrationPage }) => {
//       const user = structuredClone(authentication.registration.emptyEmail);

//       await registrationPage.navigate();

//       await registrationPage.register(user);

//       // RegistrationValidator.expectEmailRequired(
//       //   await registrationPage.getErrorMessage(),
//       // );
//     });

//     test("Empty password", async ({ registrationPage }) => {
//       const user = structuredClone(authentication.registration.emptyPassword);

//       await registrationPage.navigate();

//       await registrationPage.register(user);

//       // RegistrationValidator.expectPasswordRequired(
//       //   await registrationPage.getErrorMessage(),
//       // );
//     });
//   });
// });
