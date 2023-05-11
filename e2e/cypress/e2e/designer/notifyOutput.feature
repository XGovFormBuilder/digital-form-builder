Feature: Notify output allows lists
  As a user
  I want to add a notify output
  So that I can send emails to customers using values from the form submission

  Background:
    Given I am on the new configuration page
    And I enter the form name "editing-links"
    When I submit the form with the button title "Next"

  Scenario: Create GOVNotify output
    When I open the lists menu
    And Add a new list with 3 list items
      | itemText | itemValue |
      | Item 1   | Item 1    |
      | Item 2   | Item 2    |
      | Item 3   | Item 3    |
    * I open Outputs
    * I choose Add output
    * I use the GOVnotify output type
    * I add a personalisation
    Then "New list (List)" should appear in the Description dropdown