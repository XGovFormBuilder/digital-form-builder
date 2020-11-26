@footer
Feature: Accessibility statement
  As a forms designer
  I want to be able to view the cookies, accessibility statement and terms & conditions
  So that I am aware of how my data is used

  Scenario: The footer and links are visible on start page
    Given I am on the new configuration page
    Then I can see the footer element at the bottom of the page

  Scenario: The footer and links are visible on designer page
    Given I am on the form designer page
    Then I can see the footer element at the bottom of the page

  Scenario: The cookies link opens a tab to the cookies page
    Given I am on the new configuration page
    When I select the "Cookies" in the footer
    Then I can see a new tab is opened with the "Cookies" information page

  Scenario: The accessibility statement link opens a tab to the accessibility statement page
    Given I am on the new configuration page
    When I select the "Accessibility Statement" in the footer
    Then I can see a new tab is opened with the "Accessibility Statement" information page

  Scenario: The terms and conditions statement link opens a tab to the terms and conditions page
    Given I am on the new configuration page
    When I select the "Terms and Conditions" in the footer
    Then I can see a new tab is opened with the "Terms and Conditions" information page