import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("The list {string} should exist", (listName) => {
  cy.findByTestId("menu-lists").click();
  cy.findAllByTestId("edit-list").findByText(listName);
  cy.findByText("Close").click();
});

When("I open Outputs", () => {
  cy.findByTestId("menu-outputs").click();
});

When("I choose Add output", () => {
  cy.findByTestId("add-output").click();
});

When("I use the GOVUK notify output type", () => {
  cy.findByLabelText("Output type").select("Email via GOVUK Notify");
});

When("I add a personalisation", () => {
  cy.findByTestId("add-notify-personalisation").click();
});

Then("{string} should appear in the Description dropdown", (string) => {
  cy.contains('[id="link-source"] option', string);
});
