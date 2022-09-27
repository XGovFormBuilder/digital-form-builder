Then("I don't see the page {string}", (pageTitle) => {
  cy.findByText(pageTitle).should("not.exist");
});
