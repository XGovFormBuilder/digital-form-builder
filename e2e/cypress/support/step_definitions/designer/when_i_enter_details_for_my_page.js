import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I enter the details for my page", (table) => {
  /**
   * Use these table headings in your gherkin files (.feature)
   | type | linkFrom | title | path | newSection | section |
   */
  const {
    type,
    linkFrom,
    title,
    path,
    newSection,
    section,
  } = table.hashes()[0];

  if (type) {
    cy.findByLabelText("Page type").select(type);
  }

  if (linkFrom) {
    cy.findByLabelText("Link from (optional)").select(linkFrom);
  }

  if (title) {
    cy.findByLabelText("Page title").type(title);
  }

  if (path) {
    cy.findByLabelText("Path").type(path);
  }

  if (section) {
    cy.findByLabelText("Section (optional)").select(section);
  }
  cy.findByRole("button", { name: "Save" }).click();
});
