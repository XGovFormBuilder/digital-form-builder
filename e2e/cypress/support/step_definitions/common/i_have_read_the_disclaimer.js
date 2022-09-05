When("I have read the disclaimer", () => {
  cy.findByRole("checkbox").click();
  cy.findByRole("button").click();
});
