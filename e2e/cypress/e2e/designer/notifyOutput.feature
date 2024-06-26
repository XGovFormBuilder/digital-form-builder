Feature: Notify output allows lists
  As a user
  I want to add a notify output
  So that I can send emails to customers using values from the form submission

  Background:
    Given the form "notifyOutput" exists
    When I am viewing the designer at "/app/designer/notifyOutput"
    Then The list "New list" should exist

  Scenario: Create GOVNotify output
    When I open Outputs
    * I choose Add output
    * I use the GOVUK notify output type
    * I add a personalisation
    Then "New list (List)" should appear in the Description dropdown
