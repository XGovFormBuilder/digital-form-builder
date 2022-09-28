import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I choose {string} for {string}", (option, label) => {
  cy.findByRole("group", { name: label }).within(() => {
    cy.findByLabelText(option).click();
  });
});
