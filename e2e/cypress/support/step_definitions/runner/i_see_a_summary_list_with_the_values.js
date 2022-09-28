import { Then } from "@badeball/cypress-cucumber-preprocessor";
import { findByText } from "@testing-library/dom";
Then("I see a summary list with the values", (table) => {
  const expectedRows = table.hashes();

  const rows = cy.findAllByRole("term");

  rows.each((row, i) => {
    const parent = row.parent()[0];
    findByText(parent, expectedRows[i].title, { ignore: "span" });
    findByText(parent, expectedRows[i].value);
  });
});
