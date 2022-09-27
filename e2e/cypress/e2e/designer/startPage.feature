Feature: Start Page
  As a form designer
  I want to give my form a unique name
  So that I can edit it at a later date

  Scenario: Starting a form without entering a name displays an error
    Given I am on the new configuration page
    When I try to create a new form without entering a form name
    Then I am alerted to the error "Enter form name"

  Scenario: Creating a form with a name that already exists displays an error
    Given I am on the new configuration page
    When I enter "test" for "Title"
    And I submit the form with the button title "Next"
    Then I am alerted to the error "A form with this name already exists"

  Scenario: Create new form, go back to previous page
    Given I am on the form designer start page
    When I choose "Open an existing form"
    And I submit the form with the button title "Next"
    * I open Back to previous page
    Then I see "Design and prototype forms"

  Scenario: Open an existing form
    Given I am on the form designer start page
    When I choose "Open an existing form"
    And I submit the form with the button title "Next"
    And I force open the link "test"
    Then I see the heading "Start"

  Scenario: Open an existing form duplicates the form with a different ID
    Given I am on the form designer start page
    When I choose "Open an existing form"
    And I submit the form with the button title "Next"
    And I force open the link "test"
    Then the form id is not "test"
