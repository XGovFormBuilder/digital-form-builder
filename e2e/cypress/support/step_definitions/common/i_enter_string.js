import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I enter {string}", (string) => {
  cy.findByRole("textbox").type(string);
});
