Feature: Smoke tests
  As a tester
  I want to run smoke test against the designer
  So that I am confident the designer is stable enough to deploy

  Background: Create new config
    Given I have created a new form configuration

  Scenario: Add a component to a page
    When I add a "Date field" control to the "Question page"
    Then the Date field control is displayed in the page

  Scenario: Edit a page title
    When I edit the page title on the "Question page"
    Then the changes are reflected in the page designer

  Scenario: Add a page
    When I choose "Add Page" from the designer menu
    And I enter the details for my page
    Then the page is added in the designer

  Scenario: Link two pages
    When I choose "Add Link" from the designer menu
    And I link the "Question page" to the "Summary"
    Then a link between them will be displayed

  Scenario: Edit Sections from the form designer menu
    When I choose "Edit Sections" from the designer menu
    And I add a new section
    Then the section should be available when I edit the Question page
