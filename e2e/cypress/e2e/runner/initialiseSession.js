import { When } from "@badeball/cypress-cucumber-preprocessor";

When("the session is initialised with the options", (table) => {
  //     | form | callbackUrl | redirectPath | message | htmlMessage | title | redirectUrl
  const { form, redirectUrl, ...options } = table.hashes()[0];
  const url = `${Cypress.env("RUNNER_URL")}/session/${form}`;
  cy.request("POST", url, {
    options: {
      ...options,
      skipSummary: {
        redirectUrl,
      },
    },
    questions: [],
  }).then((res) => {
    cy.wrap(res.body.token).as("token");
  });
});

When("I go to the initialised session URL", () => {
  const res = cy.get("@token").then((token) => {
    cy.visit(`${Cypress.env("RUNNER_URL")}/session/${token}`);
  });
});

When("I revisit the status page", () => {
  cy.visit(`${Cypress.env("RUNNER_URL")}/initialiseSession/status`);
});

When("I declare and continue", () => {
  cy.findByLabelText("Confirm").click();
  cy.findByRole("button", { name: /Save and continue/i, exact: false }).click();
});
