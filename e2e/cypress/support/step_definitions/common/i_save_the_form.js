import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I save the form", () => {
  cy.findByRole("button", { name: /Save and continue/i, exact: false }).click();
});
