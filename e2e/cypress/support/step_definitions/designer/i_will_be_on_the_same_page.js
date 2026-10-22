import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I will be on the same page", () => {
  cy.get("@urlBeforeNavigatingAway").then((urlBeforeNavigatingAway) => {
    cy.url().should("eq", urlBeforeNavigatingAway);
  });
});
