Then("I see the heading {string}", (string) => {
  cy.findByRole("heading", { name: string });
});
