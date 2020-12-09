Feature: Start Page
  As a form designer
  I want to give my form a unique name
  So that I can edit it at a later date

  Scenario: Starting a form without entering a name displays an error
    Given I am on the form designer start page
    When I try to create a new form without entering a form name
    Then I am informed there is a problem
    And the error message "Enter form name" is displayed