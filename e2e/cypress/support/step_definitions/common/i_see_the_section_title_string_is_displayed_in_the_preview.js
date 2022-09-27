
Then(
  "I see the section title {string} is displayed in the preview",
  (string) => {
    cy.findByText(string);
  }
);