import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate to {string}", (url) => {
  cy.visit(`${Cypress.env("RUNNER_URL")}${url}`);
});
