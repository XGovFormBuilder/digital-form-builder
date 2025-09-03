Feature: Repeat field
  As a user,
  I want to be able to add multiple entries for a field,
  So that I can provide more than one answer

  Scenario: Adding a new entry to a repeat field
    Given the form "repeat-field" exists
    And I navigate to the "repeat-field" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    Then I see "French"

  Scenario: Adding a multiple entries to a repeat field
    Given the form "repeat-field" exists
    And I navigate to the "repeat-field" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    Then I see "French"
    When I enter "Italian{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    Then I see "Italian"

  Scenario: Removing an entry from a repeat field
    Given the form "repeat-field" exists
    And I navigate to the "repeat-field" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    Then I see "French"
    And I click the link "Remove Language 1"
    And I don't see "French"

  Scenario: Mini summary page displays repeat field entries
    Given the form "repeat-field" exists
    And I navigate to the "repeat-field" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    When I enter "Italian{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    And I continue
    Then I see "French"
    And I see "Italian"
    And I see "You have selected these languages"

  Scenario: Add another from summary page
    Given the form "repeat-field" exists
    And I navigate to the "repeat-field" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    And I continue
    And I see "You have selected these languages"
    And I select the button "Add another"
    And I enter "Italian{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    And I select the button "Continue"
    Then I see "Italian"

  Scenario: Final summary page displays repeat field entries
    Given the form "repeat-field" exists
    And I navigate to the "repeat-field" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    When I enter "Italian{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    And I continue
    And I continue
    Then I see "Check your answers"
    And I see "French, Italian"