import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I select the option {string}", (string) => {
  cy.get("select").select(string);
});
