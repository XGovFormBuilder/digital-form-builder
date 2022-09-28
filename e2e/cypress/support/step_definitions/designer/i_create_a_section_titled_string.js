When("I create a section titled {string}", (string) => {
  cy.findByRole("link", { name: "Create section" }).click();
  cy.findByLabelText("Section title").type(string);
  cy.findByTestId("flyout-1").within(() => {
    cy.findByRole("button", { name: "Save" }).click();
  });
  cy.findByRole("button", { name: "Save" }).click();
});