import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I will go back to my previous page", () => {
  cy.get("@urlBeforeNavigatingAway").then((urlBeforeNavigatingAway) => {
    cy.url().should("not.eq", urlBeforeNavigatingAway);
  });
});
