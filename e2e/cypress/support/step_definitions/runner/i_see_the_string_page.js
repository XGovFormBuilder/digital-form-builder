import { Then } from "@badeball/cypress-cucumber-preprocessor";

const pagesMap = {
  upload: "Upload a file",
  imageQualityPlayback: "Check your image",
  summary: "Summary",
};
Then("I see the {string} page", (page) => {
  cy.findByText(pagesMap[page]);
});
