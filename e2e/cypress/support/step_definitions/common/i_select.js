import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I select", (table) => {
  const values = table.raw()[0];

  values.forEach((value) => {
    cy.findByLabelText(value).check();
  });
});
