Feature: Form pages
  As a forms designer
  I want to create, update and delete pages
  So that I can designer a form for my users

  Background: Create new config
    Given I have created a new form configuration

  Scenario: Edit a page title
    When I edit the page title on the "First page"
    Then the changes are reflected in the page designer

  Scenario: Add a page
    When I choose "Add Page" from the designer menu
    And I enter the details for my page
    Then the page is added in the designer

  Scenario: Duplicate a page
    When I choose to duplicate the "Summary"
    Then 2 "Summary" pages are shown in the designer

  Scenario: Delete a page
    When I choose to delete the "First page"
    Then the "First page" is no longer visible in the designer
