@lists
Feature: List components
  As a forms designer
  I want to create, update and delete list components
  So that my form has the correct components

  Background: Create a list
    Given I am on the new configuration page
    And I enter the form name "smoke-tests-list-components"
    When I submit the form with the button title "Next"
    When I open "Lists"
    And I open the link "Add a new list"
    * I enter "Types of egg" for "List title"
    * I add the list items
      | text          | help                   | value     |
      | sunny-side up | fried but not flipped  | sunny     |
      | over-easy     | fried and flipped over | over-easy |
      | scrambled     |                        | scrambled |
      | raw           |                        | raw       |
    * I save the list
    * I close the flyout


  Scenario Outline: Hints are rendered
    When I create a component
      | page       | component   | title                   | list         |
      | First page | <component> | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see the options with hints
      | text          | hint                   |
      | sunny-side up | fried but not flipped  |
      | over-easy     | fried and flipped over |
      | scrambled     |                        |
      | raw           |                        |
    And I see the heading "First page"
    Examples:
      | component  |
      | Radios     |
      | Checkboxes |

  Scenario: Select field renders all options
    When I create a component
      | page       | component | title                   | list         |
      | First page | Select    | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see the dropdown options
      | labelText  | options                               |
      | First page | sunny-side up,over-easy,scrambled,raw |

  Scenario: Autocomplete field renders all options
    When I create a component
      | page       | component    | title                   | list         |
      | First page | Autocomplete | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see the typeahead options
      | labelText  | options                               |
      | First page | sunny-side up,over-easy,scrambled,raw |

  Scenario: The page title is displayed when there are two components
    When I create a component
      | page       | component | title                   | list         |
      | First page | Radios    | Which eggs do you like? | Types of egg |
    And I create a component
      | page       | component | title |
      | First page | Text      | Other |
    * I preview the page "First page"
    Then I see the heading "First page"
    * I see "Which eggs do you like?"
    * I see the field "Other"

  Scenario: List items can be deleted
    When I create a component
      | page       | component | title                   | list         |
      | First page | Radios    | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see the options with hints
      | text          | hint                   |
      | sunny-side up | fried but not flipped  |
      | over-easy     | fried and flipped over |
      | scrambled     |                        |
    When I go back to the designer
    And I open "Lists"
    And I open the link "Types of egg"
    And I delete the list item "scrambled"
    * I save the list
    * I preview the page "First page"
    Then I don't see "scrambled"


  Scenario: List items can be edited
    When I create a component
      | page       | component | title                   | list         |
      | First page | Radios    | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see the options with hints
      | text          | hint                   |
      | sunny-side up | fried but not flipped  |
      | over-easy     | fried and flipped over |
      | scrambled     |                        |
    When I go back to the designer
    And I open "Lists"
    And I open the link "Types of egg"
    And I edit the list item
      | initialItem | text | help                    | value |
      | scrambled   |      | eggs whisked with cream |       |
    * I save the list
    * I preview the page "First page"
    Then I see "eggs whisked with cream"

  Scenario: Content lists render
    When I create a component
      | page       | component | title                   | list         |
      | First page | List      | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see
      | text          |
      | sunny-side up |
      | over-easy     |
      | scrambled     |
      | raw           |

  Scenario: Flashcard renders with descriptions
    When I create a component
      | page       | component  | title                   | list         |
      | First page | Flash card | Which eggs do you like? | Types of egg |
    And I preview the page "First page"
    Then I see
      | text          | hint                   |
      | sunny-side up | fried but not flipped  |
      | over-easy     | fried and flipped over |
      | scrambled     |                        |
      | raw           |                        |


