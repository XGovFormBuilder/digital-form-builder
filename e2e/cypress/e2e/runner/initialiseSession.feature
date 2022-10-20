Feature: Initialise session - prepopulate a session

  Scenario: Without customisations the default text is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl     | redirectPath | message | htmlMessage | title |
      | initialiseSession | http://webho.ok | /summary     |         |             |       |
    And I go to the initialised session URL
    Then I see "Summary"


  Scenario: The configured message is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl     | redirectPath | message                     | htmlMessage | title |
      | initialiseSession | http://webho.ok | /summary     | your favourite egg is wrong |             |       |
    And I go to the initialised session URL
    Then I see "Summary"
    And I see "your favourite egg is wrong"

  Scenario: The configured htmlMessage is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl     | redirectPath | message | htmlMessage                      | title |
      | initialiseSession | http://webho.ok | /summary     |         | <p>This is not a type of egg</p> |       |
    And I go to the initialised session URL
    Then I see "Summary"
    And I see "This is not a type of egg"
    And I don't see "<p>"

  Scenario: The configured title is displayed
    Given the form "initialiseSession" exists
    When the session is initialised with the options
      | form              | callbackUrl     | redirectPath | message | htmlMessage | title               |
      | initialiseSession | http://webho.ok | /summary     |         |             | Update your details |
    And I go to the initialised session URL
    Then I see "Update your details"


