Feature: Image quality playback page

  Background:
    Given the form "image-quality-playback" exists

 Scenario Outline: Handling upload
    Given I navigate to the "image-quality-playback" form
    When I upload a file that "<case>"
    Then I see the heading "<heading>"
   Examples:
    | case       | heading                   |
    | fails-ocr  | Check your image          |
    | passes     | Summary                   |

 Scenario Outline: Navigating away from the playback page
   Given I navigate to the "image-quality-playback" form
   When I upload a file that "fails-ocr"
   And I choose "<option>"
   And I continue
   Then I see the heading "<heading>"
  Examples:
   | option                                     | heading        |
   | No - I'm happy with the image              | Summary        |
   | Yes - I would like to upload a new image   | Upload a file  |
