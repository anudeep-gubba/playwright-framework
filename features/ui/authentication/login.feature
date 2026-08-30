@ui
Feature: Login
  As a registered user
  I want to log in with my credentials
  So that I can access my dashboard

  Background:
    Given I am on the login page

  @smoke
  Scenario: Valid user should login successfully
    When I log in with the "validUser" credentials
    Then I should be redirected to the dashboard

  @regression @negative
  Scenario Outline: Invalid <credentialKey> should display a login error
    When I log in with the "<credentialKey>" credentials
    Then a login error should be displayed

    Examples:
      | credentialKey   |
      | invalidPassword |
      | invalidEmail    |
