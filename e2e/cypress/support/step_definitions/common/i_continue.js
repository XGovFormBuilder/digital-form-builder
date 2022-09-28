import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I continue", () => {
  cy.findByRole("button", { name: /continue/i }).click();
});
