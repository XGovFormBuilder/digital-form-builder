Feature: Components
  As a forms designer
  I want to create, update and delete components
  So that I capture the information in my form

  Background: Create new config
    Given I have created a new form configuration

  Scenario: Return to the component list without creating a component
    When I choose to create a component for the "First page"
    And I select "Details" component to add to the page
    Then I am able to return to components list with creating the component

  Scenario Outline: Add a component to a page
    When I add a "<type>" control to the "First page"
    Then the "<type>" control is displayed in the "First page"
    And the "<type>" is displayed when I Preview the page
    Examples:
      | type          |
      | Date          |
      | Date parts    |
      | Date time     |
      | Email address |
      | Paragraph     |
      | Text          |

  Scenario: Add multiple components to a page
    When I add multiple components to the "First page"
    Then all the components are displayed in the "First page"

  Scenario: Delete a component
    When I add a "Date" control to the "First page"
    And I delete the "Date" control from the "First page"
    Then the "Date" will not be visible in the "First page"

  Scenario: Edit Sections from the form designer menu
    When I choose "Edit Sections" from the designer menu
    And I add a new section
    Then the section should be available when I edit the Question page