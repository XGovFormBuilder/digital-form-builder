# Created by calum-ukhsa at 29/07/2025
Feature: New page controller that display summaries of parts of the form data

  @wip
  Scenario: MiniSummaryPageController displays the correct content
    When a page utilises the MiniSummaryPageController
    And data has already been provided in the journey
    Then I will see a summary of the page's section or, if the latter is null, the first section of form data
