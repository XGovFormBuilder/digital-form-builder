import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the new configuration page", () => {
  cy.visit(`${Cypress.env("DESIGNER_URL")}/app/new`);
  cy.findByText("Enter a name for your form");
});
