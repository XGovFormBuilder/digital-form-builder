Feature: Smoke tests
  As a tester
  I want to run smoke test against the designer
  So that I am confident the designer is stable enough to deploy

  Background: Create new config
    Given I have created a new form configuration

  Scenario Outline: Add a component to a page
    When I add a "<type>" control to the "First page"
    Then the "<type>" control is displayed in the "First page"
    Examples:
      | type                |
      | Date field          |
      | Date parts field    |
      | Date time field     |
      | Email address field |
      | Paragraph           |

  Scenario: Add mulitple components to a page
    When I add multiple components to the "First page"
    Then all the components are displayed in the "First page"

  Scenario: Delete a component
    When I add a "Date field" control to the "First page"
    And I delete the "Date field" control from the "First page"
    Then the "Date field" will not be visible in the "First page"

  Scenario: Edit a page title
    When I edit the page title on the "First page"
    Then the changes are reflected in the page designer

  Scenario: Add a page
    When I choose "Add Page" from the designer menu
    And I enter the details for my page
    Then the page is added in the designer

  Scenario: Link two pages
    When I choose "Add Link" from the designer menu
    And I link the "First page" to the "Summary"
    Then a link between them will be displayed

  Scenario: Edit Sections from the form designer menu
    When I choose "Edit Sections" from the designer menu
    And I add a new section
    Then the section should be available when I edit the Question page

  Scenario: Edit Lists
    And I choose "Edit Lists" from the designer menu
    When I add a new list
    And I create a "List" control for the "First page"
    Then the list is available in the list options

  Scenario: Duplicate a page
    When I choose to duplicate the "Summary"
    Then 2 "Summary" pages are shown in the designer

  Scenario: Delete a page
    When I choose to delete the "First page"
    Then the "First page" is no longer visible in the designer
