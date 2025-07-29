# Created by calum-ukhsa at 29/07/2025
Feature: New page controllers that display summaries of parts of the form data

  Scenario: MiniSummaryPageController displays the correct content
    When a page utilises the MiniSummaryPageController
    And data has already been provided in the journey
    Then I see a summary of data that doesn't belong to a section
    Or, if all data provided belongs to a section, I'll instead see a summary of the first section

  Scenario: RepeatingSectionSummaryPageController displays the correct content
    When a page utilises the RepeatingSectionSummaryPageController
    Then I will see a summary of any sections with titles that are the page title, followed by a number

  Scenario: Removal of sections in RepeatingSectionSummaryPageController pages
    When a page utilises the RepeatingSectionSummaryPageController
    And there is more than one section present on the page
    And I append a query parameter 'remove' to the URL while on the page
    And the value of the parameter equals the title of a section
    Then the data within the section will be cleared
    Then a redirect occurs
    Then I won't see the section that has been cleared onscreen
