import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("There is a condition available {string}", (conditionName) => {
  cy.findByRole("button", { name: "Conditions" }).click();
  cy.findAllByTestId("conditions-list-item").findByText(conditionName);
  cy.findByText("Close").click();
});

When("I am on the fees menu", () => {
  cy.findByRole("button", { name: "Fees" }).click();
});

When("I have added a fee", () => {
  cy.findByRole("button", { name: "Add" }).click();
});

Then("I should be able to choose a number in the quantity column", () => {
  cy.get('[id="multiplier"]').type("2");
});

When("I have clicked the link that says {string}", (linkName) => {
  cy.findByRole("button", { name: linkName }).click();
});

Then(
  "I should be able to choose the number field from the quantity list, but not the text field",
  () => {
    cy.contains('[id="multiplier"] option', "Quantity of item");
    cy.contains('[id="multiplier"] option', "Text field").should("not.exist");
  }
);
