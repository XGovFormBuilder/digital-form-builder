import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I am redirected to {string}", (url) => {
  cy.url().should("contain", url);
});
