Feature: Repeat field - same page summary
  As a user,
  I want to see the summary of my repeat field entries on the same page,
  so that I can review my answers as I add them

  Scenario: Only separate page summary is displayed
    Given the form "repeat-field-separate-page" exists
    And I navigate to the "repeat-field-separate-page" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Continue"
    And I select the button "Add another"
    And I enter "Italian{enter}" for "Which languages do you translate or interpret?"
    Then I don't see "French"
    When I select the button "Continue"
    Then I see "You have selected these languages"
    Then I see "French"
    And I see "Italian"
    When I continue
    Then I see "Check your answers"
    And I see "French, Italian"
