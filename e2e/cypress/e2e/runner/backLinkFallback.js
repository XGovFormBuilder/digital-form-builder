import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("The back link href is {string}", (href) => {
  cy.findByRole("link", { name: "Back" })
    .should("have.attr", "href")
    .and("eq", href);
});
