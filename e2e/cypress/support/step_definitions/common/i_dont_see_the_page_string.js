import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I don't see the page {string}", (pageTitle) => {
  cy.findByText(pageTitle).should("not.exist");
});
