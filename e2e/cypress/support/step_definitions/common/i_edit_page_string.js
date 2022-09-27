When("I edit the page {string}", (string) => {
  cy.findByText(string, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      cy.findByRole("button", { name: "Edit page" }).click();
    });
});

Then("I don't see {string}", (string) => {
  cy.findByText(string).should("not.exist");
});
