import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see {string}", (string) => {
  cy.findByText(string, {
    exact: false,
    ignore: ".govuk-visually-hidden,title,.autocomplete-wrapper option",
  });
});
