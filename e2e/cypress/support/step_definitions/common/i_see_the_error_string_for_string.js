import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I see the error {string} for {string}", (error, fieldName) => {
  cy.findByText("Fix the following errors");
  cy.findByRole("link", { name: error });
  cy.findByRole("group", { description: `Error: ${error}` });
});
