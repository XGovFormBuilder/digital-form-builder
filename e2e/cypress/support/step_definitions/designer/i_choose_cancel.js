import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I choose cancel", () => {
  cy.on("window:confirm", () => false);
});
