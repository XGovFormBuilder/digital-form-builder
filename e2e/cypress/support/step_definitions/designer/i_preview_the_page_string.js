import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I preview the page {string}", (pageName) => {
  cy.findByText(pageName, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      cy.get(`a[title="Preview page"]`)
        .invoke("attr", "href")
        .then(($val) => {
          cy.origin(
            `http://localhost:3009`,
            { args: { pageName: $val } },
            ({ pageName }) => {
              cy.visit(pageName);
            }
          );
        });
    });
});
