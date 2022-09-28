
When("I enter {string}", (string) => {
  cy.findByRole("textbox").type(string);
});
