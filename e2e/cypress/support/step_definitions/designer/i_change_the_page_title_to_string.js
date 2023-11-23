import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I change the page title to {string}", (string) => {
  cy.findByLabelText("Page title").clear().type(string);
  cy.findByRole("button", { name: "Save" }).click();
});
