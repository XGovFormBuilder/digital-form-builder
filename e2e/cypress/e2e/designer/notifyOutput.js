import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I open the lists menu", () => {
  cy.findByTestId("menu-lists").click();
});

When("Add a new list with 3 list items", (table) => {
  cy.findByTestId("add-list").click();
  cy.findByLabelText("List title").type("New list");
  const items = table.hashes();
  items.forEach((item) => {
    cy.findByTestId("add-list-item").click();
    cy.findByLabelText("Item text").type(item.itemText);
    cy.findByLabelText("Value").type(item.itemValue);
    cy.findByTestId("save-list-item").click();
  });
  cy.findByTestId("save-list").click();
  cy.findByText("Close").click();
});

When("I open Outputs", () => {
  cy.findByTestId("menu-outputs").click();
});

When("I choose Add output", () => {
  cy.findByTestId("add-output").click();
});

When("I use the GOVnotify output type", () => {
  cy.findByLabelText("Output type").select("Email via GOVUK Notify");
});

When("I add a personalisation", () => {
  cy.findByTestId("add-notify-personalisation").click();
});

Then("{string} should appear in the Description dropdown", (string) => {
  cy.contains('[id="link-source"] option', string);
});
