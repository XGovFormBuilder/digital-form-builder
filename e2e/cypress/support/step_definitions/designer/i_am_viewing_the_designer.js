import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am viewing the designer at {string}", (path) => {
  cy.visit(`${Cypress.env.DESIGNER_PATH}${path}`);
});
