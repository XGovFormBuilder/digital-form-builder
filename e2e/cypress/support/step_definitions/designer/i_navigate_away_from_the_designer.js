import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate away from the designer workspace", () => {
  cy.url().as("urlBeforeNavigatingAway");
  cy.window().its("history").invoke("back");
});
