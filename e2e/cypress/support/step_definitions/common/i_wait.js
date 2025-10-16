import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I wait {int} milliseconds", (milliseconds) => {
  cy.wait(Number(milliseconds));
});
