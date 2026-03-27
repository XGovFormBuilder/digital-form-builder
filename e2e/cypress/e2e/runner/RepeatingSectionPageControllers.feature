# Created by calum-ukhsa at 27/03/2026
Feature: New page controllers that allow for repeating sections of form data

  Scenario: RepeatingSection page controllers work as expected
    Given the form "repeating-sections" exists
    And I navigate to the "repeating-sections" form
    When I enter "Joe" for "First name"
    And I enter "Bloggs" for "Last name"
    And I continue
    Then I see "Check these details are correct before continuing"
    And I see "Joe"
    And I see "Bloggs"
    Then I choose "Yes"
    And I continue
    And I enter "Joel" for "First name"
    And I continue
    Then I see "Joel"
