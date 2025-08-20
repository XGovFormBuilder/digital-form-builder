import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I see the error {string} for {string}", (error, fieldName) => {
  cy.findByText("There is a problem");
  cy.findByRole("link", { name: error });
  cy.findByRole("group", { description: `Error: ${error}` });
});
