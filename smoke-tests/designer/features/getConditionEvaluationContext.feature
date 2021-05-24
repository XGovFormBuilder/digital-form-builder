Feature: Get Condition Evaluation Context
  As a forms user
  I want to complete a form and return to a previous point and enter different input
  So that I can confirm the Condition Evaluation Context is correct

  Scenario: Conditional text is displayed when fulfilling the condition
    Given I am at the start of the "get condition evaluation context" form
    And I choose "Yes" for "Do you have a UK passport?"
    When I progress to the TestConditions page
    Then the header "TestConditions" "is" displayed
    And the text "There Is Someone Called Applicant" "is" displayed

  Scenario: Conditional text is not displayed when changing the route you took through the form
    Given I see the text "There Is Someone Called Applicant" on the TestConditions page
    And I go back to the "Do you have a UK passport?" page
    When I choose "No" for "Do you have a UK passport?"
    Then the header "TestConditions" "is" displayed
    And the text "There Is Someone Called Applicant" "is not" displayed
