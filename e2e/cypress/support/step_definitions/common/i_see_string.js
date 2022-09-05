Then("I see {string}", (string) => {
  cy.findByText(string, { exact: false });
});
