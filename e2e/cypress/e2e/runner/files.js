import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I upload the file {string}", (filename) => {
  cy.get("input[type=file]").attachFile(filename);
  cy.findByRole("button", { name: /continue/i }).click();
});
