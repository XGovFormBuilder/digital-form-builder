# Created by calum-ukhsa at 29/07/2025
Feature: New page controller that display summaries of parts of the form data

  Scenario: MiniSummaryPageController works as expected
    Given the form "mini-summary-fields" exists
    And I navigate to the "mini-summary-fields" form
    When I enter "Joe{enter}" for "First name"
    And I enter "Bloggs{enter}" for "Last name"
    And I enter "123{enter}" for "Code"
    Then I see "Check these details are correct before continuing"
    And I see "Joe"
    And I see "Bloggs"
    And I don't see "123"
    And I see "Confirm and continue"
    Then I click the link "Change"
    And I enter "Joel{enter}" for "First name"
    And I see "Joel"
    Then I continue
    And I see "Fourth page"
