Feature: Repeat field - separate page summary
  As a user,
  I want to see the summary of my repeat field entries on a different page,
  so that not too much information is displayed

  Scenario: Only same page summary is displayed
    Given the form "repeat-field-same-page" exists
    And I navigate to the "repeat-field-same-page" form
    When I enter "French{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    And I enter "Italian{enter}" for "Which languages do you translate or interpret?"
    And I select the button "Add to list"
    Then I see "French"
    And I see "Italian"
    When I continue
    Then I see "Check your answers"
    # Final summary page
    And I see "French, Italian"
    # Mini summary not displayed separately
    And I don't see "You have selected these languages"
