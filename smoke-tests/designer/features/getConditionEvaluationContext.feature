Feature: Get Condition Evaluation Context
  As a forms user
  I want to complete a form and return to a previous point and enter different input
  So that I can confirm the Condition Evaluation Context is correct

  Background:
    Given I am at the start of the "get condition evaluation context" form
    And I complete the form as if I have a UK passport until I reach the TestConditions page
    Then the TestConditions page is displayed
    And I see a paragraph containing "There Is Someone Called Applicant"

  Scenario: Complete a form then return to the start and take alternate route and validate conditional component is not displayed
    Given I see a paragraph containing "There Is Someone Called Applicant"
    And I go back to the start page
    And I complete the form as if I do not have a UK passport until I reach the TestConditions page
    When the TestConditions page is displayed
    Then I do not see a paragraph containing "There Is Someone Called Applicant"
