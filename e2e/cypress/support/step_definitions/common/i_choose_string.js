
When("I choose {string}", (string) => {
  cy.findByLabelText(string).check();
});
