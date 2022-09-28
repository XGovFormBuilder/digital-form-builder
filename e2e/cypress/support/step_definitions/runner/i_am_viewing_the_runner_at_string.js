Given("I am viewing the runner at {string}", (path = "/") => {
  cy.visit(`${Cypress.env.RUNNER_URL}${path}`);
});
