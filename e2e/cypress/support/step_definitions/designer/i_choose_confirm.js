import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I choose confirm", () => {
  cy.on("window:confirm", () => true);
});
