Feature: Linking Pages
  As a user
  I want to link two pages
  So that I can decide the path users take

  Scenario: Linking pages using Add link
    Given I have created a new form configuration
    When I choose "Add Link" from the designer menu
    And I link the "First page" to the "Summary"
    Then a link between them will be displayed

  Scenario: Linking pages when adding a page
    Given I have chosen to "Add Page" to my form
    When I link ths page to link from the "/first-page"
    Then my page is created with a link to the page

  Scenario: Deleting a link between two pages
    Given I have linked the "First page" to the the "Summary"
    When I delete the link between the pages
    Then the link is no longer displayed
