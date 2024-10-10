import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I click on the page link {string}", (string) => {
  cy.findByTestId(string).click({ force: true });
});

Then("These conditions should be shown in the conditions dropdown", (table) => {
  let conditionArray = table.raw()[0];
  cy.get(`#select-condition`)
    .children()
    .then((options) => {
      let validConditions = [...options].map((option) => {
        return option.innerText;
      });
      expect(
        conditionArray.every((condition) => validConditions.includes(condition))
      ).to.be.true;
    });
});

Then(
  "These conditions should NOT be shown in the conditions dropdown",
  (table) => {
    let conditionArray = table.raw()[0];
    cy.get(`#select-condition`)
      .children()
      .then((options) => {
        let validConditions = [...options].map((option) => {
          return option.innerText;
        });
        expect(
          conditionArray.some((condition) =>
            validConditions.includes(condition)
          )
        ).to.be.false;
      });
  }
);
