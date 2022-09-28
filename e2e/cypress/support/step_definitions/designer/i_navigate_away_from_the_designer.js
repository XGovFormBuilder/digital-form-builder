When("I navigate away from the designer workspace", () => {
  cy.window().invoke("history").invoke("back");
});