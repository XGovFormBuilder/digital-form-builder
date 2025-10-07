import { When } from "@badeball/cypress-cucumber-preprocessor";

// Accept either:  When I wait 1000 milliseconds
// or: When I wait "1000" milliseconds
When(/^I wait\s+"?(\d+)"?\s+milliseconds$/, (milliseconds) => {
  cy.wait(Number(milliseconds));
});