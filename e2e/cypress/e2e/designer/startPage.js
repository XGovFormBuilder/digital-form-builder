import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I try to create a new form without entering a form name", () => {
  cy.findByRole("button", { name: "Next" }).click();
});

Then("I am alerted to the error {string}", (string) => {
  cy.findByRole("alert").within(() => {
    cy.findByText(string);
  });
});

Given("I am on the form designer start page", () => {
  cy.visit(`${Cypress.env("DESIGNER_URL")}/app`);
});

Then("the form id is not {string}", (string) => {
  cy.url().should("not.include", string);
});

When("I open Back to previous page", () => {
  cy.findByText("Back to previous page").click({ force: true });
});
