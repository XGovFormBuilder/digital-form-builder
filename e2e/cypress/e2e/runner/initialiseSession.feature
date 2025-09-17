Feature: Initialise session - prepopulate a session

  Scenario: Without customisations the default text is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl                                                | redirectPath | message | htmlMessage | title |
      | initialiseSession | https://61bca17e-fe74-40e0-9c15-a901ad120eca.mock.pstmn.io | /summary     |         |             |       |
    And I go to the initialised session URL
    Then I see the heading "Summary"


  Scenario: The configured message is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl                                                | redirectPath | message                     | htmlMessage | title |
      | initialiseSession | https://61bca17e-fe74-40e0-9c15-a901ad120eca.mock.pstmn.io | /summary     | your favourite egg is wrong |             |       |
    And I go to the initialised session URL
    Then I see the heading "Summary"
    And I see "your favourite egg is wrong"

  Scenario: The configured htmlMessage is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl                                                 | redirectPath | message | htmlMessage                      | title |
      | initialiseSession | https://61bca17e-fe74-40e0-9c15-a901ad120eca.mock.pstmn.io | /summary     |         | <p>This is not a type of egg</p> |       |
    And I go to the initialised session URL
    Then I see the heading "Summary"
    And I see "This is not a type of egg"
    And I don't see "<p>"

  Scenario: The configured title is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl                                                | redirectPath | message | htmlMessage | title               |
      | initialiseSession | https://61bca17e-fe74-40e0-9c15-a901ad120eca.mock.pstmn.io | /summary     |         |             | Update your details |
    And I go to the initialised session URL
    Then I see "Update your details"


  Scenario: The configured title is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl                                                | redirectPath | message | htmlMessage | title               | redirectUrl |
      | initialiseSession | https://61bca17e-fe74-40e0-9c15-a901ad120eca.mock.pstmn.io | /summary     |         |             | Update your details | http://localhost:3009/help/cookies |
    And I go to the initialised session URL
    And I declare and continue
    Then I see "Cookies are files saved on your phone"
    When  I revisit the status page
    Then I see "Cookies are files saved on your phone"
