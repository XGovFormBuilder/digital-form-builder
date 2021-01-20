@lists
Feature: List components
  As a forms designer
  I want to create, update and delete list components
  So that my form has the correct components

  Background: Create new config
    Given I have created a new form configuration

  Scenario: Create a Global list
    And I choose "Edit Lists" from the designer menu
    When I add a new Global list named "European Countries"
    And I create a "List" control for the "First page"
    Then the list is available in the list options

  Scenario: Adding a list item to a Global list
    And I have created a "Global" list with 1 list item
    When I add another list item to the Global list
    Then the Global list has 2 list items
    And I am able to save the edited Global list

  Scenario: Deleting a list item from a Global list
    And I have created a "Global" list with 2 list items
    When I delete the 1st list item from the "global" list
    Then the Global list only has one item

  Scenario: Editing a list item in a Global list
    And I have created a "Global" list with 2 list items
    When I edit the 1st list item from the "global" list
    Then the 1st list item reflects the changes I made

  Scenario: Create a Local list
    And I add a "List" control to the "First page"
    When I edit the "List" component
    And I create a new component list with 1 item
    Then the list is selected in the list dropdown

  Scenario: Adding a list item to a Local list
    And I have created a "Local" list with 1 list item
    When I create a 2nd list item for the Local list
    Then the Local list has 2 list items

  Scenario: Deleting a list item from a local list
    And I have created a "Local" list with 2 list items
    When I delete the 1st list item from the "Local" list
    Then the Local list only has one item

  Scenario: Editing a list item in a Local list
    And I have created a "Local" list with 2 list items
    When I edit the 1st list item from the "local" list
    Then the 1st list item reflects the changes I made