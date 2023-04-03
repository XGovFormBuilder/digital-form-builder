import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am editing {string}", (formName) => {
  const url = `${Cypress.env("DESIGNER_URL")}/${formName}`;
  cy.visit(url);
});
