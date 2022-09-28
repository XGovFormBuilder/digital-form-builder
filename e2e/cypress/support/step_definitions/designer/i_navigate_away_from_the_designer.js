import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate away from the designer workspace", () => {
  cy.window().invoke("history").invoke("back");
});
