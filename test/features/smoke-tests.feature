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
    Then the page is added in the designer
