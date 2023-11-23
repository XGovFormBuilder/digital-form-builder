import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I go back", () => {
  cy.findByRole("link", {
    name: "Go back to application overview",
    matchCase: false,
  }).click();
});
