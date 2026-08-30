import { createBdd } from "playwright-bdd";

import { test } from "../../../../fixtures/testFixture";
import { TestData } from "../../../../data";
import { UiData } from "../../../../data/models/UiData";
import { CheckoutValidator } from "../../../../validators/CheckoutValidator";

const { Given, When, Then, BeforeAll } = createBdd(test);

let uiData: UiData;
let productName: string;

// Tag-scoped so this hook — and the customTest it's bound to — only applies to @ui
// scenarios; an unscoped BeforeAll runs for every generated feature file regardless
// of tags, which confuses bddgen's per-feature test-instance guessing across layers.
BeforeAll({ tags: "@ui" }, async () => {
  uiData = await TestData.load<UiData>("uiData");
});

Given("I am logged in as a valid user", async ({ loginPage }) => {
  const user = structuredClone(uiData.login.validUser);

  await loginPage.navigate();
  await loginPage.login(user);
  await loginPage.waitForLoad();
});

Given("I have searched for the configured product", async ({ homePage }) => {
  ({ productName } = structuredClone(uiData.checkout));

  await homePage.searchProduct(productName);
});

When("I add the product to my cart and proceed to checkout", async ({ homePage, cartPage }) => {
  await homePage.addProductToCart(productName);
  await homePage.goToCart();
  await cartPage.checkout();
});

When("I enter valid payment details", async ({ checkoutPage }) => {
  const { payment } = structuredClone(uiData.checkout);

  await checkoutPage.enterPaymentDetails(payment);
  await checkoutPage.selectCountry(payment.country);
});

When("I place the order", async ({ checkoutPage }) => {
  await checkoutPage.placeOrder();
});

Then("my order should be confirmed", async ({ orderConfirmationPage }) => {
  CheckoutValidator.expectOrderConfirmed(await orderConfirmationPage.getConfirmationMessage());
});

Then("the order should appear in my order history", async ({ orderConfirmationPage, ordersPage }) => {
  await orderConfirmationPage.goToOrders();

  CheckoutValidator.expectOrderInHistory(await ordersPage.isProductInOrders(productName));
});
