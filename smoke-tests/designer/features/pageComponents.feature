Feature: Page Components
  As a forms designer
  I want to create, update and delete components
  So that I capture the information in my form

  Scenario: Return to the component list without creating a component
    Given I have created a new form configuration
    When I choose to create a component for the "First page"
    And I select "Details" component to add to the page
    Then I am able to return to components list with creating the component

  Scenario Outline: Add a component to a page
    Given I have created a new form configuration
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

  Scenario Outline: Add an optional component to a page
    Given I have created a new form configuration
    And I add an optional "<type>" control to the "First page"
    When I preview the "First page" page
    And I choose to "Continue"
    Then the "Second page" is displayed
    Examples:
      | type          |
      | Date          |
      | Date parts    |
      | Date time     |
      | Email address |
      | Text          |

  Scenario: Ensure a checkbox is still checked after navigating back
    Given I have created a form with a "Checkboxes" on the "First page"
    And I preview the "First page" page
    When I continue to the next page after selecting "List item 1"
    And I navigate back using the link
    Then the checkbox "List item 1" is still checked

  Scenario: Ensure a Yes/No radio is still checked after navigating back
    Given I have a form with a "YesNo" field on the "First page"
    And I preview the "First page" page
    When I continue to the next page after selecting "Yes"
    And I navigate back using the link
    Then the radio button "Yes" is still checked

  Scenario: Progress to the Summary after filling in Checkboxes
    Given I have created a new form configuration
    And I have created a list with 2 list items
    When I add a "Checkboxes" control for the "Second page"
    And I preview the "Second" page
    Then I can check a checkbox
    And progress to the "Summary" page

  Scenario: Add multiple components to a page
    Given I have created a new form configuration
    When I add multiple components to the "First page"
    Then all the components are displayed in the "First page"

  Scenario: Delete a component
    Given I have created a new form configuration
    When I add a "Date" control to the "First page"
    And I delete the "Date" control from the "First page"
    Then the "Date" will not be visible in the "First page"

  Scenario: Edit Sections from the form designer menu
    Given I have created a new form configuration
    And I choose "Sections" from the designer menu
    When I add a new section titled "Your property details"
    And I choose Edit page for the "Second page"
    Then the section should be available when I edit the Question page
