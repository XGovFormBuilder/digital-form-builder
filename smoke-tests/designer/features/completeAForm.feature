Feature: Complete a form
  As a forms user
  I want to complete a form
  So that I submit my form successfully

  # Cookie issue exists in the pipeline
  @wip
  Scenario: Complete the report a Terrorist form
    Given I am at the start of the "report a terrorist" form
    And I complete the form
    When I view the Summary page
    And I submit the completed form
    Then the "Application complete" page is displayed

  Scenario: Testing condition - User does not have a link
    Given I am at the start of the "report a terrorist" form
    When I choose "No, I don't have a link"
    Then I taken directly to the page titled "Do you have any evidence?"

  Scenario: Testing condition - User does have evidence
    Given I am at the start of the "report a terrorist" form
    And I have progressed to the Do you have any evidence? page
    When I choose "Yes, I have evidence"
    Then I taken directly to the page titled "Yes I have evidence"

  Scenario: Complete the runner components test form
    Given I am at the start of the "runner components test" form
    When I complete the form
    Then the Summary page is displayed with my answers