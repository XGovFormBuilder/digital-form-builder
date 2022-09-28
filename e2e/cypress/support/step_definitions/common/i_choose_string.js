import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I choose {string}", (string) => {
  cy.findByLabelText(string).check();
});
