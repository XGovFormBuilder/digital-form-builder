Feature: Components
  As a forms user
  I want to complete a form
  So that I submit my form successfully

  @wip
  Scenario: Complete the report a Terrorist form
    Given I am at the beginning of the report a terrorist form
    And I complete the form
    When I view the Summary page
    And I submit the completed form
    Then the "Application complete" page is displayed

