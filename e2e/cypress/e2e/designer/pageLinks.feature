Feature: Page links
  As a user
  I want to add, delete and edit links
  So that I can decide the path users take in my form

  Background:
    Given I am on the new configuration page
    And I enter the form name "editing-links"
    When I submit the form with the button title "Next"

  Scenario: Editing links
    Then the link panels are correct
      | linkId                 | fromPage    | toPage      |
      | first-page-second-page | First page  | Second page |
      | second-page-summary    | Second page | Summary     |

  Scenario: Add a link between pages
    When I open "Add link"
    And I link the "First page" to "Summary"
    Then the page link "first-page-summary" exists

  Scenario: Linking pages when adding a page
    When I open "Add page"
    And I enter the details for my page
      | type | linkFrom    | title                 | path | newSection | section |
      |      | /first-page | What is your address? |      |            |         |
    Then the page link "first-page-what-is-your-address" exists

  Scenario: Deleting a link between two pages
    When I delete the link "first-page-second-page"
    Then the link "first-page-second-page" doesn't exist

