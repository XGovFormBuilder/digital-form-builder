Feature: Smoke tests
  As a tester
  I want to run smoke test against the designer
  So that I am confident the designer is stable enough to deploy

  Background: Create new config
    Given I have created a new form

  Scenario: Add a component to a page
    When I add a "Date field" control to the page
    Then the Date field control is displayed in the page

  Scenario: Edit a page title
    When I edit a page
    Then the changes are reflected in the page designer
