# Created by calum-ukhsa at 29/07/2025
Feature: MiniSummaryPageController, a page controller that display summaries of parts of the form data

  Scenario: MiniSummaryPageController displays the correct content
    Given the form "mini-summary-fields" exists
    And I navigate to the "mini-summary-fields" form
    When I enter "Joe{enter}" for "First name"
    And I enter "Bloggs{enter}" for "Last name"
    Then I see "Joe"
    And I see "Bloggs"
