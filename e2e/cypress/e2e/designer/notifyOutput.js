import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
Then("The list {string} exists", (listName) => {
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

When("I choose the GOVUK notify output type", () => {
  cy.findByLabelText("Output type").select("Email via GOVUK Notify");
});

Then("The the GOVUK notify output type should be selected", () => {
  cy.findByLabelText("Output type").should("have.value", "notify");
});

When("I add a personalisation", () => {
  cy.findByTestId("add-notify-personalisation").click();
});

Then("{string} should appear in the Description dropdown", (string) => {
  cy.contains('[id="link-source"] option', string);
});

When("I enter {string} for the email address", (string) => {
  cy.findByLabelText("Email field").type(string);
});

When("I input values for the title, template ID and api key", () => {
  cy.findByLabelText("Title").type("New output");
  cy.findByLabelText("Template ID").type("Template-ID");
  cy.findByLabelText("API Key").type("API-key");
});

When("I save the output", () => {
  cy.findByRole("button", { name: "Save" }).click();
});

Then("The output should save with the value {string}", (string) => {
  cy.findAllByRole("button").contains("New output").click();
  cy.findByLabelText("Email field").should("have.value", string);
});

When("I click the button {string}", (string) => {
  cy.findAllByRole("button").contains(string).click();
});

When("I choose the email address field {string}", (string) => {
  cy.findByLabelText("Email field").select(string);
});
