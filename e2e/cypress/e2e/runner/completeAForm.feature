Feature: Complete a form
  As a forms user
  I want to complete a form
  So that I submit my form successfully

  Scenario: Complete the report a Terrorist form
    Given I navigate to the "report-a-terrorist" form
    When I choose "Yes, I do have a link"
    And I continue
    * I enter "link-to-the-material.co"
    * I continue
    * I choose "No, I don't have evidence"
    * I continue
    * I enter "the additional info" for "Additional Info (Optional)"
    * I continue
    Then I see a summary list with the values
      | title                               | value                     |
      | Do you have a link to the material? | Yes, I do have a link     |
      | Link to the material                | link-to-the-material.co   |
      | Do you have any evidence?           | No, I don't have evidence |
      | Additional Info                     | the additional info       |
    When I submit the form
    Then I see "Application complete"


  Scenario: Testing condition - User does not have a link
    Given I navigate to the "report-a-terrorist" form
    When I choose "No, I don't have a link"
    * I continue
    Then I see the heading "Do you have any evidence?"

  Scenario: Testing condition - User does have evidence
    Given I navigate to the "report-a-terrorist" form
    When I choose "Yes, I do have a link"
    * I continue
    * I enter "link-to-the-material.co"
    * I continue
    * I choose "No, I don't have evidence"

  Scenario: Check components render and input-able
    Given I navigate to the "components" form
    When I enter "a text field" for "Text field"
    * I enter "a multiline field" for "Multiline text field"
    * I enter "0" for "Number field"
    * I enter "2025-12-25" for "Date field"
    * I enter the date "2022-12-25" in parts for "datePartsField"
    * I enter "11:11" for "Time field"
    * I enter "2025-12-25T11:11:00" for "Date time field"
    * I enter the date "2025-12-25T11:11:00" in parts for "dateTimePartsField"
    * I choose "Yes"
    * I enter "jen+forms@cautionyourblast.com" for "Email address field"
    * I enter "123" for "Telephone number field"
    * I enter "line 1" for "Address line 1"
    * I enter "line 2" for "Address line 2 (Optional)"
    * I enter "London" for "Town or city"
    * I enter "ec2a4ps" for "Postcode"
    * I choose "Sole trader"
    * I select "United Kingdom" for "Select field"
    * I choose "Shetland"
    * I expand "Title" to see "Content"
    #    TODO:- submit and check that values are being rendered correctly



  Scenario: Complete the runner test form
    Given I navigate to the "runner-components-test" form
    When I choose "Yes"
    And I continue
    * I enter "line 1" for "Address line 1"
    * I enter "line 2" for "Address line 2 (Optional)"
    * I enter "London" for "Town or city"
    * I enter "ec2a4ps" for "Postcode"
    * I enter "2025-12-25" for "What date was the vehicle registered at this address?"
    * I select
      | Bath | Bristol |
    * I continue
    * I select "Alfa Romeo" for "What is the make of you vehicle?"
    * I enter "fast car" for "Vehicle Model"
    * I enter the date "2022-12-25" in parts for "4LZ9to"
    * I choose "Electric" for "What fuel type does your vehicle use?"
    * I enter "no" for "Has the vehicle been modified in any way?"
    * I continue
    * I enter "1" for "How many people in your household drive this vehicle?"
    * I enter "Doc Brown" for "Full name of the main driver"
    * I enter "001" for "Contact number"
    * I continue
    * I enter "jen+forms@cautionyourblast.com" for "Your email address"
    * I continue
    * I submit the form
    Then I see "Application complete"


  Scenario: Error messages are displayed and can be resolved
    Given I navigate to the "report-a-terrorist" form
    When I continue
    Then I see the error "Do you have a link to the material? is required" for "Do you have a link to the material?"

