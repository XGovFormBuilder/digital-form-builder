import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I upload a file that {string}", (string) => {
  let file = "bad-file.png";
  if (string === "passes") {
    file = "good-file.png";
  }

  cy.get("input[type=file]").attachFile(file);
  cy.findByRole("button", { name: /continue/i }).click();
});
