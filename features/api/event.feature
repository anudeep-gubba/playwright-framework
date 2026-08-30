@api
Feature: Event CRUD
  As an authenticated API client
  I want to create, update and delete an event
  So that event management works end-to-end

  @regression
  Scenario: Login, create, update and delete an event via API
    Given I log in via the API with valid credentials
    Then the login should succeed and return an auth token
    When I create an event
    Then the event should be created successfully
    When I update the event
    Then the event should be updated successfully
    When I delete the event
    Then the event should be deleted successfully
