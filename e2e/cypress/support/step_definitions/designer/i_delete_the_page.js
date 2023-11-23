import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I delete the page", () => {
  cy.findByRole("button", { name: "Delete" }).click();
  // cy.on("window:confirm", () => true);
});
