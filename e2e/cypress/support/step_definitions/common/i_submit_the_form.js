When("I submit the form", () => {
  cy.findByRole("button", { name: /submit/i, exact: false }).click();
});
