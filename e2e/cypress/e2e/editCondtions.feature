@edit-conditions
Feature: Edit Conditions
  As a user
  I want to edit conditions for components
  So that components behave correctly

  Scenario: Create a condition using Edit Conditions
    Given I am on the new configuration page
    And I enter the form name "smoke-tests-edit-conditions"
    When I submit the form with the button title "Next"
    * I create a component
      | page       | component  | title            | name | hideTitle | optional | additional |
      | First page | Date parts | Date of purchase |      |           |          |            |
    * I open "Conditions"
    * I open the link "Add condition"
    * I enter "smoke condition" for "Display name"
    * I select "Date of purchase" for the field with the name "cond-field"
    * I select "is after" for the field with the name "cond-operator"
    * I enter "25" for "Day"
    * I enter "12" for "Month"
    * I enter "2022" for "Year"
    * I add the condition
    * I save the condition
    Then I see the condition "Smoke condition"


  Scenario: Create a condition using Edit Conditions
    Given I am on the new configuration page
    When I enter the form name "smoke-tests-edit-conditions"
    And I submit the form with the button title "Next"
    * I create a component
      | page       | component | title                  | name | hideTitle | optional | additional |
      | First page | YesNo     | Do you have a receipt? |      |           |          |            |
    * I open "Conditions"
    * I open the link "Add condition"
    * I enter "smoke condition" for "Display name"
    * I select "Do you have a receipt?" for the field with the name "cond-field"
    * I select "is" for the field with the name "cond-operator"
    * I select "Yes" for the field with the name "cond-value"
    * I add the condition
    * I save the condition
    * I close the flyout
    * I select the page link with test id "first-page-second-page"
    * I select the condition "smoke condition"
    * I save my link
    Then I see the condition "smoke condition"
