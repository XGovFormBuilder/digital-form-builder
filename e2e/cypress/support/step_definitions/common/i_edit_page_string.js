When("I edit the page {string}", (string) => {
  cy.findByText(string, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      cy.findByRole("button", { name: "Edit page" }).click();
    });
});

When("I change the page title to {string}", (string) => {
  cy.findByLabelText("Page title").clear().type(string);
  cy.findByRole("button", { name: "Save" }).click();
});
When("I change the page path to {string}", (string) => {});

When("I preview the page {string}", (string) => {
  const previewUrl = cy
    .findByText(string, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      const v = cy.get(`a[title="Preview page"]`).invoke("attr", "href");
      console.log("v", v);
    });
  console.log("preview", previewUrl);

  cy.origin(`${Cypress.env.RUNNER_URL}`, () => {
    cy.visit(href);
  });
});

When("I create a section titled {string}", (string) => {
  cy.findByRole("link", { name: "Create section" }).click();
  cy.findByLabelText("Section title").type(string);
  cy.findByRole("button", { name: "Save" }).click();
  cy.findByRole("button", { name: "Save" }).click();
});

When("I delete the page", () => {
  cy.findByRole("button", { name: "Delete" }).click();
  window.confirm();
});

When("I navigate away from the designer workspace", () => {
  cy.go("back");
});

Then("I will see an alert warning me that {string}", () => {});

When("I choose confirm", () => {});

Then("I will go back to my previous page", () => {});

When("I choose cancel", () => {});

Then("I will be on the same page", () => {});
