import { nanoid } from "nanoid";

When("I enter {string} for {string}", (answer, label) => {
  cy.findByLabelText(label).type(answer);
});
