Feature: Get Condition Evaluation Context
  As a forms user
  I want to complete a form and return to a previous point and enter different input
  So that I can confirm the Condition Evaluation Context is correct

  Scenario: Conditional text is displayed when fulfilling the condition
    Given I navigate to the "get-condition-evaluation-context" form
    When I choose "Yes" for "Do you have a UK passport?"
    And I continue
    * I select "1" for "How many applicants are there?"
    * I continue
    * I enter "Applicant" for "First name"
    * I enter "d'egg" for "Surname"
    * I continue
    Then I see "There Is Someone Called Applicant"
    When I go back
    And I enter "{selectAll}{backspace}Scrambled" for "First name"
    * I continue
    * I see "TestConditions"
    Then I don't see "There Is Someone Called Applicant"
