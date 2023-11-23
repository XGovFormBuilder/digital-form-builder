import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I will see an alert warning me that {string}", (string) => {
  cy.on("window:confirm", (text) => {
    expect(text).to.contain(string);
  });
});
