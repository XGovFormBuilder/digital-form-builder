import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I see the error {string} for {string}", (error, fieldName) => {
  cy.findByRole("alert", { name: "Fix the following errors" }).click();
  cy.findByRole("link", { name: error });
  cy.findByRole("group", { description: `Error: ${error}` });
});
