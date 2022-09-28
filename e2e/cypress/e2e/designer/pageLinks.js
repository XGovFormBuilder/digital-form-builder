import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("the link panels are correct", (table) => {
  const links = table.hashes();

  links.forEach(({ linkId, fromPage, toPage }) => {
    cy.findByTestId(linkId).click();
    cy.findByDisplayValue(fromPage);
    cy.findByDisplayValue(toPage);
    cy.findByText("Close").click();
  });
});

When("I link the {string} to {string}", (fromPage, toPage) => {
  cy.findByLabelText("From").select(fromPage);
  cy.findByLabelText("To").select(toPage);
  cy.findByRole("button", { name: "Save" }).click();
});

Then("the page link {string} exists", (string) => {
  cy.findByTestId(string);
});

When("I delete the link {string}", (string) => {
  cy.findByTestId(string).click();
  cy.findByRole("button", { name: "Delete" }).click();
});

Then("the link {string} doesn't exist", (string) => {
  cy.findByTestId(string).should("not.exist");
});
