Feature: Accessibility statement
  As a forms designer
  I want to be able to view the cookies, accessibility statement and terms & conditions
  So that I am aware of how my data is used

  Scenario: The links are visible on the start page
    Given I am on the new configuration page
    Then I can see the footer element at the bottom of the page

  Scenario: Footer is visible on designer page when scrolling down
    Given I am on the form designer page
    When I scroll down to the end of the page
    Then I can see the footer element

  @wip
  Scenario:
    Given I click the footer's Cookies link
    Then I can see a new tab is opened with the Cookies information page

  @wip
  Scenario:
    Given I click the the footer's Accessibility Statement link
    Then I can see a new tab is opened with the Accessibility Statement placeholder page.

  @wip
  Scenario:
    Given I click the the footer's Terms and Conditions link
    Then I can see a new tab is opened with the Terms and Conditions information page