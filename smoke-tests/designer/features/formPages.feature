Feature: Form pages
  As a forms designer
  I want to create, update and delete pages
  So that I can design a form for my users

  Background: Create new config
    Given I have created a new form configuration

    @wip
  Scenario: Edit a page title
    When I edit the page title on the "First page"
    Then the changes are reflected in the page designer

  Scenario: Add a page
    When I choose "Add Page" from the designer menu
    And I enter the details for my page
    Then the page is added in the designer

  Scenario: Delete a page
    When I choose to delete the "First page"
    Then the "First page" is no longer visible in the designer

  Scenario: Navigating away
    When I navigate away from the designer workspace
    Then I will see an alert warning me that I am about to leave the page

  Scenario: Confirm navigating away
    When I navigate away from the designer workspace
    And I choose confirm
    Then I will go back to my previous page

  Scenario: Cancel navigating away
    When I navigate away from the designer workspace
    And I choose cancel
    Then I will be on the same page