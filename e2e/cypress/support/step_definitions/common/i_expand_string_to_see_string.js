import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I expand {string} to see {string}", (title, content) => {
  cy.get(".govuk-details__summary").click();
  cy.findByText(content);
});
