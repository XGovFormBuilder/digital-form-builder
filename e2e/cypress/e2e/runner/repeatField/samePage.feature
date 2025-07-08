Feature: Repeat field - same page summary
  As a user,
  I want to see the summary of my repeat field entries on the same page,
  so that I can review my answers as I add them

  Scenario: Mini summary page displays repeat field entries
    Given the form "repeat-field-same-page" exists
    And I navigate to the "repeat-field-same-page" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    Then I see "French"
    When I continue
    Then I see "Check your answers"