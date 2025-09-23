import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I enter the day {string} for {string}", (day, fieldName) => {
  cy.get(`#${fieldName}`).within(() => {
    cy.findByLabelText("Day").type(day);
  });
});

When("I enter the month {string} for {string}", (month, fieldName) => {
  cy.get(`#${fieldName}`).within(() => {
    cy.findByLabelText("Month").type(month);
  });
});

When("I enter the year {string} for {string}", (year, fieldName) => {
  cy.get(`#${fieldName}`).within(() => {
    cy.findByLabelText("Year").type(year);
  });
});

Then("I see the date parts error {string}", (error) => {
  /**
   * Date parts only show one error at a time.
   */
  cy.findByText("There is a problem");
  cy.findByRole("link", { name: error, exact: false });
});

Then(
  "I see the date parts with a partial error string {string} for {string}",
  (error, fieldName) => {
    /**
     * Date parts only show one error at a time.
     */
    cy.findByText("There is a problem");
    cy.get(`#${fieldName}-error`).within(() => {
      cy.findByText(error, { exact: false });
    });
  }
);

When(
  "I enter a date {int} days in the future for {string}",
  (days, fieldName) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + days);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    cy.get(`#${fieldName}`).within(() => {
      cy.findByLabelText("Day").type(day);
      cy.findByLabelText("Month").type(month);
      cy.findByLabelText("Year").type(year);
    });
  }
);

When(
  "I enter a date {int} days in the past for {string}",
  (days, fieldName) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - days);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    cy.get(`#${fieldName}`).within(() => {
      cy.findByLabelText("Day").type(day);
      cy.findByLabelText("Month").type(month);
      cy.findByLabelText("Year").type(year);
    });
  }
);
