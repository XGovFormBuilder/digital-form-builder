Feature: Repeat field - hide rows
  As a designer,
  I want to be able to hide rows in summaries,
  So that I can improve UX depending on the context of the question

  Scenario: Rows are shown in the summary
    Given the form "repeat-field-show-rows" exists
    And I navigate to the "repeat-field-show-rows" form
    When I enter "French{enter}" for "Which languages do you translate?"
    And I select the button "Add to list"
    Then I see "Language 1"
    And I enter "Italian{enter}" for "Which languages do you translate?"
    And I select the button "Add to list"
    Then I see "Language 1"
    And I see "Language 2"
    When I continue
    Then I see "Language 1"
    And I see "Language 2"


  Scenario: Rows are hidden in the summary
    Given the form "repeat-field-hide-rows" exists
    And I navigate to the "repeat-field-hide-rows" form
    When I enter "French{enter}" for "Which languages do you translate?"
    And I select the button "Add to list"
    Then I see "Language 1"
    And I enter "Italian{enter}" for "Which languages do you translate?"
    And I select the button "Add to list"
    Then I don't see "Language 1"
    And I don't see "Language 2"
    When I continue
    Then I don't see "Language 1"
    And I don't see "Language 2"

