@lists
Feature: List components
  As a forms designer
  I want to create, update and delete list components
  So that my form has the correct components

  Scenario: A list can be created
    Given I am on the new configuration page
    And I enter the form name "smoke-tests-list-components"
    When I submit the form with the button title "Next"
    When I open "Lists"
    And I open the link "Add a new list"
    * I enter "Types of egg" for "List title"
    * I add the list items
      | text          | help                   | value     |
      | sunny-side up | fried but not flipped  | sunny     |
      | over-easy     | fried and flipped over | over-easy |
      | scrambled     |                        | scrambled |
      | raw           |                        | raw       |
    * I save the list
    * I close the flyout
    * I open "Lists"
    * I open the link "Types of egg"
    Then I see "sunny-side up"
