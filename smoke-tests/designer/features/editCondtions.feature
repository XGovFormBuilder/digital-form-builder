Feature: Edit Conditions
  As a user
  I want to edit conditions for components
  So that components behave correctly

  @wip
Scenario: Create a condition using Edit Conditions
  Given I have created a new form configuration
  And I add a "Date field" control to the "First page"
  When I choose to "Edit Conditions"
  And I add a condition for the "Date field"
  Then the condition is created
