import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I don't see {string}", (string) => {
  cy.findByText(string).should("not.exist");
});
