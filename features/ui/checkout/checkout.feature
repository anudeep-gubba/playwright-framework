@ui @e2e
Feature: Checkout
  As a logged-in shopper
  I want to buy a product
  So that it appears in my order history

  @smoke
  Scenario: Valid user should complete checkout and see the order in history
    Given I am logged in as a valid user
    And I have searched for the configured product
    When I add the product to my cart and proceed to checkout
    And I enter valid payment details
    And I place the order
    Then my order should be confirmed
    And the order should appear in my order history
