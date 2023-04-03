import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I preview the page {string}", (pageName) => {
  const pageComponent = cy
    .findByText(pageName, { ignore: ".govuk-visually-hidden" })
    .closest(".page");

  pageComponent.within(($a) => {
    console.log("$a", $a);
    cy.get(`a[title="Preview page"]`).then(($a) => {
      // pull off the fully qualified href from the <a>
      const url = $a.prop("href");

      // make a cy.request to it
      cy.origin(`localhost:3009`, { args: { url } }, ({ url }) => {
        cy.visit(url);
      });
    });
  });
});
