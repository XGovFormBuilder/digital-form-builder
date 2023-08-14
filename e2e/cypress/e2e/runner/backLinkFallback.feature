Feature: Back link fallback
  As a service team,
  I want to be able to configure a back link fallback,
  so that there is seamless integration between my different services

  As a user,
  I want to click the back link,
  so that I can return to the previous page or service.

  Scenario: Back link is displayed when there is no history
    Given the form "backLinkFallback" exists
    When I navigate to the "backLinkFallback" form
    Then The back link href is "/help/cookies"

  Scenario: Back link fallback is not used if there is session history
    Given the form "backLinkFallback" exists
    When I navigate to the "backLinkFallback" form
    Then The back link href is "/help/cookies"
    When I continue
    Then The back link href is "/backLinkFallback/start"