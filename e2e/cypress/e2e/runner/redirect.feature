Feature: Back link fallback
  As a service team,
  I want to redirect to another URL
  So that part of the service may be completed by another form or url

  Scenario: Redirects to another page
    Given the form "redirects" exists
    When I navigate to the "redirects" form
    And I enter "Turkey" for "Start"
    And I continue
    Then I see "Cookies are files saved on your phone, tablet or computer when you visit a website."

  Scenario: Continues to next page
    Given the form "redirects" exists
    When I navigate to the "redirects" form
    And I enter "Thailand" for "Start"
    And I continue
    Then I see "Second page"
