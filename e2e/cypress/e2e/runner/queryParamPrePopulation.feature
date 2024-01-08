# Created by lukezigler at 05/01/2024
Feature: Query parameter pre-population
  As a user
  If I am directed to the service with query parameters in the URL
  the values from the query parameters should be pre-populated
  So that I do not need to fill values in the new form

  Background:
    Given the form "query-param-form" exists
    And the form "disabled-query-param-form" exists

  Scenario Outline: Query param testing
    When I navigate to "<start>"
    Then I am redirected to "<result>"
    And the field "Start" contains "<value>"
    Examples:
    | start                                             | result                           | value  |
    | /query-param-form?country=Turkey                  | /query-param-form/start          | Turkey |
    | /query-param-form/start?country=Turkey            | /query-param-form/start          | Turkey |
    | /query-param-form/start?country=not%20a%20country | /query-param-form/start          |        |
    | /disabled-query-param-form/start?country=Turkey   | /disabled-query-param-form/start |        |

    Scenario: Query param vs form state
      When I navigate to the "query-param-form" form
      And I enter "Turkey" for "Start"
      And I continue
      And I navigate to "/query-param-form/second-page?country=Afghanistan"
      Then I am redirected to "/query-param-form/second-page"
      And I see "You chose the option Turkey"
