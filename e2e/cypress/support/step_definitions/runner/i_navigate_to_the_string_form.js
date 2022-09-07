Given("I navigate to the {string} form", (formName) => {
  cy.visit(`${Cypress.env("RUNNER_URL")}/${formName}`);
});

When("I choose {string}", (string) => {
  cy.findByLabelText(string).check();
});

When("I continue", () => {
  cy.findByRole("button", { name: /continue/i }).click();
});

When("I submit the form", () => {
  cy.findByRole("button", { name: /submit/i, exact: false }).click();
});

When("I enter {string}", (string) => {
  cy.findByRole("textbox").type(string);
});

When("I enter {string} into {string}", (content, label) => {
  cy.findByLabelText(label).type(content);
});

import { findByText } from "@testing-library/dom";
Then("I see a summary list with the values", (table) => {
  const expectedRows = table.hashes();

  const rows = cy.findAllByRole("term");

  rows.each((row, i) => {
    const parent = row.parent()[0];
    findByText(parent, expectedRows[i].title, { ignore: "span" });
    findByText(parent, expectedRows[i].value);
  });
});

Then("I see the heading {string}", (string) => {
  cy.findByRole("heading", { name: string });
});

Then(
  "I enter the date {string} in parts for {string}",
  (dateString, fieldName) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();

    cy.findByLabelText("Day", { selector: `#${fieldName}__day` }).type(day);
    cy.findByLabelText("Month", { selector: `#${fieldName}__month` }).type(
      month
    );
    cy.findByLabelText("Year", { selector: `#${fieldName}__year` }).type(year);
    if (hour) {
      cy.findByLabelText("Hour", { selector: `#${fieldName}__hour` }).type(
        hour
      );
    }

    if (minute) {
      cy.findByLabelText("Minute", { selector: `#${fieldName}__minute` }).type(
        minute
      );
    }
  }
);

When("I select {string} for {string}", (option, label) => {
  cy.findByLabelText(label).select(option);
});

When("I expand {string} to see {string}", (title, content) => {
  cy.get(".govuk-details__summary").click();
  cy.findByText(content);
});

When("I select", (table) => {
  const values = table.raw();

  values.forEach((value) => {
    cy.findByLabelText(value).check();
  });
});

When("I see the error {string} for {string}", (error, fieldName) => {
  cy.findByRole("alert", { name: "Fix the following errors" }).click();
  cy.findByRole("link", { name: error });
  cy.findByRole("group", { description: `Error: ${error}` });
});
