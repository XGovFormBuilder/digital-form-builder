@lists
Feature: List components
  As a forms designer
  I want to create, update and delete list components
  So that my form has the correct components

  Scenario: Create a list
    Given I have created a new form configuration
    And I choose "Lists" from the designer menu
    When I add a new Global list named "European Countries"
    And I create a "List" control for the "First page"
    Then the list is available in the list options

  Scenario: Create a list and Preview it
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I add a "List" control for the "First page"
    Then the List is displayed when I Preview the page

  Scenario: Create a Radio list with items that contain help text and Preview it
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I add a "Radios" control for the "First page"
    Then the help text for Radios is displayed when I Preview the page
    And the help text is displayed for each radio item

  Scenario: Create a Radio list and verify the title is displayed
    Given I have created a form with a "Text" field on the "First page"
    And I have created a list with 2 list items
    When I add a "Radios" control for the "First page"
    Then the title for my Radio list is displayed when I Preview the page

  Scenario: Create a Radio list and verify the title is not displayed
    Given I have created a form with a "Text" field on the "First page"
    And I have created a list with 2 list items
    When I add a "Radios" control with a hidden title to the "First page"
    Then the title for my Radio list is not displayed when I Preview the page

  Scenario: Adding a list item to a list
    Given I have created a new form configuration
    And I have created a list with 1 list item
    When I add another list item to the list
    Then the Global list has 2 list items
    And I am able to save the edited Global list

  Scenario: Deleting a list item from a list
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I delete the 1st list item from the list
    Then the list only has one item

  Scenario: Editing a list item in a list
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I edit the 1st list item from the list
    Then the 1st list item reflects the changes I made

  Scenario: Adding a Checkboxes without selecting a list
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I try add "Checkboxes" to the "First page" without selecting a list
    Then the error summary is displayed

  Scenario: Adding a Flash card without selecting a list
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I try add "Flash card" to the "First page" without selecting a list
    Then the "Flash card" is successfully created

  Scenario: Adding a Flash card with a list selected
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I add a "Flash card" with a list to the "First page"
    Then the "Flash card" is successfully created