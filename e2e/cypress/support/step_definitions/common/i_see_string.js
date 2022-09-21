Then("I see {string}", (string) => {
  cy.findByText(string, {
    exact: false,
    ignore: ".govuk-visually-hidden,title",
  });
});

Then("I see the heading {string}", (string) => {
  cy.findByRole("heading", { name: string });
});
