import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I click the back link", () => {
  cy.findByRole("link", { name: "Back" }).click();
});
