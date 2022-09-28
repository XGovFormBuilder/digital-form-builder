import { nanoid } from "nanoid";
import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I enter {string} for {string}", (answer, label) => {
  cy.findByLabelText(label).type(answer);
});
