import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I upload a file that {string}", (result) => {
  cy.get("input[type=file]").attachFile(`${result}.png`);
  cy.findByRole("button", { name: /continue/i }).click();
});
