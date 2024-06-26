import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("the field {string} contains {string}", (label, value) => {
  cy.findByLabelText(label)
    .invoke("val")
    .then((val) => {
      expect(val).to.equal(value);
    });
});
