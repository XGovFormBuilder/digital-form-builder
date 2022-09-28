import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then(
  "I enter the date {string} in parts for {string}",
  (dateString, fieldName) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();

    cy.get(`#${fieldName}`).within(() => {
      cy.findByLabelText("Day").type(day);
      cy.findByLabelText("Month").type(month);
      cy.findByLabelText("Year").type(year);
      if (hour) {
        cy.findByLabelText("Hour").type(hour);
      }

      if (minute) {
        cy.findByLabelText("Minute").type(minute);
      }
    });
  }
);
