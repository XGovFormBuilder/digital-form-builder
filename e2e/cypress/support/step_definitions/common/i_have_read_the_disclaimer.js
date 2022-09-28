import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I have read the disclaimer", () => {
  cy.findByRole("checkbox").click();
  cy.findByRole("button").click();
});
