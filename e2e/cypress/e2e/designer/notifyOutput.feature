Feature: Notify output allows lists
  As a user
  I want to add a notify output
  So that I can send emails to customers using values from the form submission

  Background:
    Given the form "notifyOutput" exists
    When I am viewing the designer at "/app/designer/notifyOutput"
    * The list "New list" exists
    * I open Outputs
    * I choose Add output
    * I choose the GOVUK notify output type
    Then The the GOVUK notify output type should be selected

  Scenario: Check lists appear in the peronalisation dropdown
    When I add a personalisation
    Then "New list (List)" should appear in the Description dropdown

  Scenario: Check that static values can be used for the emailAddress field
    When I enter "test@test.com" for the email address
    * I input values for the title, template ID and api key
    * I save the output
    Then The output should save with the value "test@test.com"

  Scenario: Check that dynamic values can be used for the email address field
    When I click the button "Or choose a field"
    * I choose the email address field "TZOHRn"
    * I input values for the title, template ID and api key
    * I save the output
    Then The output should save with the value "TZOHRn"

