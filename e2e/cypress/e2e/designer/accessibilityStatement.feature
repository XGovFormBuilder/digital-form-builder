Feature: Footer links
  As a forms designer
  I want to be able to view the cookies, accessibility statement and terms & conditions
  So that I am aware of how my data is used

  Background:
    Given I am on the new configuration page

  Scenario: The cookies link opens a tab to the cookies page
    When I select "Cookies" in the footer
    Then I see "Cookies are files"

  Scenario: The accessibility statement link opens a tab to the accessibility statement page
    When I select "Accessibility Statement" in the footer
    Then I see "This statement applies to the Digital Form Designer website"

  Scenario: The terms and conditions statement link opens a tab to the terms and conditions page
    Given I am on the new configuration page
    When I select "Terms and Conditions" in the footer
    Then I see "By using this digital service you agree to our"

