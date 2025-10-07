
Feature: Confirmation timeout 

  Background: Given the form "confirmation-timeout" exists

  Scenario: Cannot see status page after waiting 10 seconds
   When I navigate to the "confirmation-timeout" form
   And I choose "Yes"
   And I continue
   Then I see a summary list with the values
      | title           | value                     |
      | Filler question | Yes                       |
   When I submit the form
   Then I see "Application complete"
   When I wait 10000 milliseconds
   And I reload
   Then I don't see "Application complete"