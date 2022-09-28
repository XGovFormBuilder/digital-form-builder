import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see the path is {string}", (string) => {
  cy.location("pathname").should("contain", string);
});
