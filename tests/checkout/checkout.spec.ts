import { test } from "../../src/fixtures/testFixture";
import { TestData } from "../../src/data";
import { UiData } from "../../src/data/models/UiData";
import { CheckoutValidator } from "../../src/validators/CheckoutValidator";

const uiData = TestData.load<UiData>("uiData");

test.describe("Shopping :: Checkout", () => {
  test("Valid user should complete checkout and see the order in history @smoke @e2e", async ({
    loginPage,
    homePage,
    cartPage,
    checkoutPage,
    orderConfirmationPage,
    ordersPage,
  }) => {
    const user = structuredClone(uiData.login.validUser);
    const { productName, payment } = structuredClone(uiData.checkout);

    await loginPage.navigate();
    await loginPage.login(user);
    await loginPage.waitForLoad();

    await homePage.searchProduct(productName);
    await homePage.addProductToCart(productName);
    await homePage.goToCart();

    await cartPage.checkout();

    await checkoutPage.enterPaymentDetails(payment);
    await checkoutPage.selectCountry(payment.country);
    await checkoutPage.placeOrder();

    CheckoutValidator.expectOrderConfirmed(await orderConfirmationPage.getConfirmationMessage());

    await orderConfirmationPage.goToOrders();

    CheckoutValidator.expectOrderInHistory(await ordersPage.isProductInOrders(productName));
  });
});
