Then("I see {string}", (string) => {
  cy.findByText(string, { exact: false, ignore: ".govuk-visually-hidden" });
});
