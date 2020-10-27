Feature: Linking Pages
  As a user
  I want to link two pages
  So that I can decide the path users take

  Scenario: Connecting pages when adding a page
    Given I have chosen to "Add Page" to my form
    When I link ths page to link from the "/first-page"
    Then my page is created with a link to the page