import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I don't see {string}", (string) => {
  cy.findByText(string, { ignore: ".autocomplete-wrapper option" }).should(
    "not.exist"
  );
});
