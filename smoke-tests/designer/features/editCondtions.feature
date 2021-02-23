@edit-conditions
Feature: Edit Conditions
  As a user
  I want to edit conditions for components
  So that components behave correctly

  Scenario: Create a condition using Edit Conditions
    Given I have created a new form configuration
    And I add a "Date" control to the "First page"
    When I choose to "Conditions"
    And I add a condition for the "Date"
    Then the condition is created
    And I can save the condition