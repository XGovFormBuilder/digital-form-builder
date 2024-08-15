Feature: File upload fields

  Background:
    Given the form "files" exists
    And the form "files-show-filenames-enabled" exists


  Scenario Outline: showFilenamesOnSummaryPage shows "Uploaded" or the filename correctly on summary pages
    And I navigate to the "<form>" form
    When I upload the file "passes.png"
    Then I see "<summaryValue>"
    Examples:
      | form                         | summaryValue |
      | files                        | Uploaded     |
      | files-show-filenames-enabled | passes.png   |


  Scenario: Uploading a file shows "You previously uploaded" message
    And I navigate to the "files" form
    When I upload the file "passes.png"
    And I navigate to "/files/file-one"
    Then I see "You previously uploaded the file ‘passes.png’"
