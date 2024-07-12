Feature: Exit
  As a user,
  I want to be able to exit the service,
  so that I can save my progress and return at a later date.

  Background:
    Given the form "exit-expiry" exists

  Scenario: Service can be exited with date displayed
    When I navigate to the "exit-expiry" form
    Then I see "Save and come back later"
    When I choose "lisbon"
    And I select the button "Save and come back later"
    And I enter "test@test.com" for "Enter your email address"
    And I select the button "Save and exit"
    Then I see "9 July 2024"
    And I see "test@test.com"


  Scenario: A user can start exiting, then go back to the form
    When I navigate to the "exit-expiry" form
    Then I see "Save and come back later"
    When I choose "lisbon"
    And I select the button "Save and come back later"
    And I go back
    Then I see "First page"

  Scenario: An initialised session can be exited
    Given the session is initialised for the exit form
    When I go to the initialised session URL
    And I select the button "Save and come back later"
    And I enter "test@test.com" for "Enter your email address"
    And I select the button "Save and exit"
    Then I see "Your application"
    # TODO: Mock the API in the e2e process so we can check for correct data sent.

