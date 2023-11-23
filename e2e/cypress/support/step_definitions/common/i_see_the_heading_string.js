import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see the heading {string}", (string) => {
  cy.findByRole("heading", { name: string });
});
