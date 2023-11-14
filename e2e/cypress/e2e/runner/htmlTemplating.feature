Feature: HTML templating in forms

  Scenario: Correct content should be shown for option one
    When the form "html-templating-example" exists
    And I choose "Answer 1"
    And I continue
    Then I see "This content is based on answer 1"
    And I see "Item 1"
    And I see "Item 2"

  Scenario: Correct content should be shown for option 2
    When the form "html-templating-example" exists
    And I choose "Answer 2"
    And I continue
    Then I see "This content is based on answer 2"
    And I see "Item 3"
    And I see "Item 4"