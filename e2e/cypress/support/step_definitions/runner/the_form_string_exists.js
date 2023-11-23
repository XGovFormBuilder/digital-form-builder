import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("the form {string} exists", (formName) => {
  const url = `${Cypress.env("RUNNER_URL")}/publish`;

  cy.fixture(`${formName}.json`, "utf-8").then((json) => {
    const requestBody = {
      id: formName,
      configuration: json,
    };
    console.log(requestBody);
    cy.request("POST", url, requestBody);
  });

  cy.visit(`${Cypress.env("RUNNER_URL")}/${formName}`);
});
