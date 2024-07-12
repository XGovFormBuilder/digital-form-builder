import { When } from "@badeball/cypress-cucumber-preprocessor";

When("the session is initialised for the exit form", () => {
  const url = `${Cypress.env("RUNNER_URL")}/session/exit-expiry`;
  cy.request("POST", url, {
    options: {
      callbackUrl: "http://localhost",
      redirectPath: "/second-page",
    },
    metadata: {
      id: "abcdef",
    },
    questions: [
      {
        fields: [
          {
            key: "whichConsulate",
            answer: "lisbon",
          },
        ],
        index: 0,
      },
      {
        category: "yourDetails",
        fields: [
          {
            key: "fullName",
            answer: "first last",
          },
        ],
      },
    ],
  }).then((res) => {
    cy.wrap(res.body.token).as("token");
  });
});
