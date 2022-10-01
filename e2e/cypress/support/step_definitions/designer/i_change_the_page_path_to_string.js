import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I change the page path to {string}", (string) => {
  cy.findByLabelText("Path").clear().type(string);
  cy.findByRole("button", { name: "Save" }).click();
});
