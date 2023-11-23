Feature: Form pages
  As a forms designer
  I want to create, update and delete pages
  So that I can design a form for my users

  Background: Create new config
    Given I am on the new configuration page
    And I enter the form name "form-pages"
    When I submit the form with the button title "Next"

  Scenario: Edit a page title
    When I edit the page "First page"
    And I change the page title to "Testing"
    * I preview the page "Testing"
    Then I see the heading "Testing"

  Scenario: Edit the page path
    When I edit the page "First page"
    And I change the page path to "my-first-test-page"
    * I preview the page "First page"
    Then I see the path is "/my-first-test-page"

  Scenario: Create a section from Edit page
    And I edit the page "First page"
    When I create a section titled "Personal Details"
    And I preview the page "First page"
    Then I see the section title "Personal Details" is displayed in the preview

  Scenario: Add a page
    When I open "Add page"
    And I enter the details for my page
      | type | linkFrom | title                 | path | newSection | section |
      |      |          | What is your address? |      |            |         |
    Then I see "What is your address?"

  Scenario: Delete a page
    When I open "Add page"
    And I enter the details for my page
      | type | linkFrom | title                 | path | newSection | section |
      |      |          | What is your address? |      |            |         |
    * I edit the page "What is your address?"
    * I delete the page
    Then I don't see the page "What is your address?"

  #TODO:- cypress can't seem to detect this so putting it as @wip for now
  @wip
  Scenario: Navigating away
    When I navigate away from the designer workspace
    Then I will see an alert warning me that ""

  @wip
  Scenario: Confirm navigating away
    When I navigate away from the designer workspace
    And I choose confirm
    Then I will go back to my previous page

  @wip
  Scenario: Cancel navigating away
    When I navigate away from the designer workspace
    And I choose cancel
    Then I will be on the same page
