When("I choose {string} for {string}", (option, label) => {
  cy.findByRole("group", { name: label }).within(() => {
    cy.findByLabelText(option).click();
  });
});

When("I click the back link", () => {
  cy.findByRole("link", { name: "Back" }).click();
});
