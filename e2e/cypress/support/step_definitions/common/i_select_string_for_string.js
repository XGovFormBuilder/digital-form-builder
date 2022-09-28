import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I select {string} for {string}", (option, label) => {
  cy.findByLabelText(label).select(option);
});
