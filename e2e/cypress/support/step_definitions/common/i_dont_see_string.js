Then("I don't see {string}", (string) => {
  cy.findByText(string).should("not.exist");
});
