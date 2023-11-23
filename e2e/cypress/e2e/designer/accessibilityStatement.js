import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I select {string} in the footer", (link) => {
  cy.get("footer").within(($footer) => {
    cy.findByRole("link", { name: link })
      .invoke("removeAttr", "target")
      .click();
  });
});
