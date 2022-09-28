import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I go back", () => {
  cy.findByRole("link", { name: "Back" }).click();
});
