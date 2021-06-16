Feature: Page links
  As a user
  I want to add, delete and edit links
  So that I can decide the path users take in my form

  Scenario Outline: Editing links
    Given I have created a new form configuration
    When I select the link between the pages "<fromPage>", "<toPage>"
    Then the "Edit Link" panel is displayed
    Examples:
      | fromPage    | toPage      |
      | first page  | second page |
      | second page | summary     |

  Scenario: Add a link between pages
    Given I have created a new form configuration
    When I choose "Add link" from the designer menu
    And I link the "First page" to the "Summary"
    Then a link between them will be displayed

  Scenario: Linking pages when adding a page
    Given I have chosen to "Add page" to my form
    When I link this page to link from the "/first-page"
    Then my page is created with a link to the page

  Scenario: Deleting a link between two pages
    Given I have created a new form configuration
    When I delete the link between the pages "first page", "second page"
    Then the link is no longer displayed

  @wip
  Scenario: Define a new condition when editing links
    Given I have a form with a "YesNo" field on the "First page"
    When I select the link between the pages "second page", "summary"
    And I choose to "Define a new condition" from the Edit link panel
    Then the Define condition panel is displayed