import { nanoid } from "nanoid";
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I submit the form with the button title {string}", (title) => {
  cy.findByRole("button", { name: title }).click();
});

When("I create a component", (table) => {
  const {
    page,
    component,
    title,
    name,
    hint,
    hideTitle,
    optional,

    additional,
    list,
    ...rest
  } = table.hashes()[0];

  cy.findByText(page, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      cy.findByRole("button", { name: "Create component" }).click();
    });

  cy.findByRole("link", { name: component }).click();
  cy.findByRole("textbox", { name: "Title" }).type(title);
  if (name) {
    cy.findByRole("textbox", { name: "Component name" }).type(name);
  }
  if (hint) {
    cy.findByRole("textbox", { name: "Help text (optional)" }).type(hint);
  }
  if (hideTitle) {
    cy.findByRole("checkbox", { name: "Hide title" }).select();
  }
  if (additional) {
    cy.get(".govuk-details__summary").click();
    //TODO:- add aditional options
  }

  if (list) {
    cy.findByLabelText("Select list").select(list);
  }

  cy.findByRole("button", { name: "Save" }).click();
});

When("I open {string}", (button) => {
  cy.findByRole("button", { name: button }).click();
});

When("I select the button {string}", (button) => {
  cy.findByRole("button", { name: button }).click();
});

When("I open the link {string}", (link) => {
  cy.findByRole("link", { name: link }).click();
});

When("I force open the link {string}", (link) => {
  cy.findByRole("link", { name: link }).click({ force: true });
});

When(
  "I select {string} for the field with the name {string}",
  (option, fieldName) => {
    const field = cy.get(`[name="${fieldName}"]`).select(option);
  }
);

When("I add the condition", () => {
  cy.findByRole("button", { name: "Add" }).click();
});

When("I save the condition", () => {
  cy.findByRole("link", { name: "Save" }).click();
});

Then("I see the condition {string}", (string) => {
  cy.findByText(string, { exact: false });
});

When("I close the flyout", () => {
  //TODO:- for whatever reason cypress and/or testing library can't find this a href.
  cy.reload();
});

When("I select the page link with test id {string}", (string) => {
  cy.findByTestId(string).click();
});

When("I add the condition {string} to the link", (string) => {
  cy.findByLabelText("Select a condition").select(string);
  cy.findByRole("button", { name: "Save" }).click();
});

When("I enter the form name {string}", (string) => {
  cy.findByRole("textbox", { name: "Title" }).type(`${string}-${nanoid(5)}`);
});

When("I select the condition {string}", (string) => {
  cy.findByLabelText("Select a condition").select(string);
});

When("I save my link", () => {
  cy.findByRole("button", { name: "Save" }).click();
});
