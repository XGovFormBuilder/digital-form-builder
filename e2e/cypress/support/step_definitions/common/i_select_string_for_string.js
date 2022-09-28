When("I select {string} for {string}", (option, label) => {
  cy.findByLabelText(label).select(option);
});