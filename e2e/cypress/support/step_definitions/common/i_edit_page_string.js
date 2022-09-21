When("I edit the page {string}", (string) => {
  cy.findByText(string, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      cy.findByRole("button", { name: "Edit page" }).click();
    });
});

When("I change the page title to {string}", (string) => {
  cy.findByLabelText("Page title").clear().type(string);
  cy.findByRole("button", { name: "Save" }).click();
});
When("I change the page path to {string}", (string) => {
  cy.findByLabelText("Path").clear().type(string);
  cy.findByRole("button", { name: "Save" }).click();
});

When("I preview the page {string}", (pageName) => {
  cy.findByText(pageName, { ignore: ".govuk-visually-hidden" })
    .closest(".page")
    .within(() => {
      cy.get(`a[title="Preview page"]`)
        .invoke("attr", "href")
        .then(($val) => {
          cy.origin(
            `http://localhost:3009`,
            { args: { pageName: $val } },
            ({ pageName }) => {
              cy.visit(pageName);
            }
          );
        });
    });
});

When("I create a section titled {string}", (string) => {
  cy.findByRole("link", { name: "Create section" }).click();
  cy.findByLabelText("Section title").type(string);
  cy.findByTestId("flyout-1").within(() => {
    cy.findByRole("button", { name: "Save" }).click();
  });
  cy.findByRole("button", { name: "Save" }).click();
});

When("I delete the page", () => {
  cy.findByRole("button", { name: "Delete" }).click();
  // cy.on("window:confirm", () => true);
});

When("I navigate away from the designer workspace", () => {
  cy.window().invoke("history").invoke("back");
});

Then("I will see an alert warning me that {string}", () => {
  cy.on("window:confirm", (text) => {
    console.log("text", text);
    expect(text).to.contains("This is an alert!");
  });
});

When("I choose confirm", () => {});

Then("I will go back to my previous page", () => {});

When("I choose cancel", () => {});

Then("I will be on the same page", () => {});

Then("I see the path is {string}", (string) => {
  cy.location("pathname").should("contain", string);
});

Then(
  "I see the section title {string} is displayed in the preview",
  (string) => {
    cy.findByText(string);
  }
);

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

Then("I don't see the page {string}", (pageTitle) => {
  cy.findByText(pageTitle).should("not.exist");
});

When("I go back", () => {
  cy.findByRole("link", { name: "Back" }).click();
});

Then("I don't see {string}", (string) => {
  cy.findByText(string).should("not.exist");
});
