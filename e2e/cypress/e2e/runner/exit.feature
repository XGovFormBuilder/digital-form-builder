Feature: Exit
  As a user,
  I want to be able to exit the service,
  so that I can save my progress and return at a later date.

  Background:
    Given the form "exit-expiry" exists
    When I navigate to the "exit-expiry" form

  Scenario: Service can be exited with date displayed
    Then I see "Save and come back later"
    When I choose "lisbon"
    And I select the button "Save and come back later"
    And I enter "test@test.com" for "Enter your email address"
    And I select the button "Save and exit"
    Then I see "9 July 2024"
    And I see "test@test.com"
