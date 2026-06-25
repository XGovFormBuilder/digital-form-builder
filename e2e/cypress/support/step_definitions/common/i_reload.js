import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I reload", () => {
  cy.reload();
});
