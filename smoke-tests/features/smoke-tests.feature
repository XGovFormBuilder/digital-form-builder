Feature: Smoke tests
  As a tester
  I want to run smoke test against the designer
  So that I am confident the designer is stable enough to deploy

  Background: Create new config
    Given I have created a new form configuration

  Scenario Outline: Add a component to a page
    When I add a "<type>" control to the "Question page"
    Then the "<type>" control is displayed in the page
    Examples:
      | type                |
      | Date field          |
      | Email address field |

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

  Scenario: Edit Lists
    And I choose "Edit Lists" from the designer menu
    When I add a new list
    And I create a "List" control for the "Question page"
    Then the list is available in the list options

  Scenario: Duplicate a page
    When I choose to duplicate the "Summary"
    Then 2 "Summary" pages are shown in the designer
