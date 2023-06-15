# Created by lukezigler at 15/05/2023
Feature: Fees can have a field or static number to be used for the quantity of the item being purchased
  As a user
  I want to add a quantity to my fee items
  So that I can make sure the user is purchasing a certain number of items based on a value entered in the form

  Background:
    Given the form "feesQuantity" exists
    When I am viewing the designer at "/app/designer/feesQuantity"
    Then There is a condition available "fee should be applied"

  Scenario:
    When I am on the fees menu
    And I have added a fee
    Then I should be able to choose a number in the quantity column

  Scenario:
    When I am on the fees menu
    And I have added a fee
    * I have clicked the link that says "Or choose a field"
    Then I should be able to choose the number field from the quantity list, but not the text field