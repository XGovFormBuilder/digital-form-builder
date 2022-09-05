When("I select the option {string}", (string) => {
  cy.get("select").select(string);
});
