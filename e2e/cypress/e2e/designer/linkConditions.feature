@link-conditions
Feature: Page link conditions
  As a user
  I want to add conditions to page links
  So that users are sent to the correct pages in the form

  Background:
    Given the form "selectConditions" exists
    When I am viewing the designer at "/app/designer/selectConditions"

  Scenario: Conditions using the first page component can be added to first page links
    When I click on the page link "first-page-page-3"
    Then These conditions should be shown in the conditions dropdown
    | Page 1 is yes | Page 1 is no |

  Scenario: Page links following pages in section should show the conditions using the fields on those pages
    When I click on the page link "page-3-page-5"
    Then These conditions should be shown in the conditions dropdown
    | Page 1 is yes | Page 1 is no |

  Scenario: Page links should accept nested conditions
    When I click on the page link "second-page-page-4"
    Then These conditions should be shown in the conditions dropdown
    | Page 1 is no and page 2 is no | Page 1 is no and page 2 is yes |

  Scenario: Page links should not accept conditions outside of their form path
    When I click on the page link "second-page-page-4"
    Then These conditions should NOT be shown in the conditions dropdown
    | Page 3 is yes | Page 3 is no |

  Scenario: Page links should not accept nested conditions outside of their form path
    When I click on the page link "second-page-page-4"
    Then These conditions should NOT be shown in the conditions dropdown
    | Page 1 is yes and page 3 is yes | Page 1 is yes and page 3 is no |

  Scenario: Page links should accept two-layer nested conditions
    When I click on the page link "page-4-summary"
    Then These conditions should be shown in the conditions dropdown
    | summary page should be shown |