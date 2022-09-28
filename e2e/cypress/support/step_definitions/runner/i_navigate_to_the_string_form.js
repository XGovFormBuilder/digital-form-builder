import { Given, When } from "@badeball/cypress-cucumber-preprocessor";

Given("I navigate to the {string} form", (formName) => {
  cy.visit(`${Cypress.env("RUNNER_URL")}/${formName}`);
});
