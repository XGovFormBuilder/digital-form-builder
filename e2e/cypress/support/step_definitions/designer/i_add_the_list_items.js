import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I add the list items", (table) => {
  //    | text | help | value | conditions |

  const listItems = table.hashes();

  listItems.forEach(({ text, help, value, conditions }) => {
    cy.findByRole("link", { name: "Add list item" }).click();

    cy.findByLabelText("Item text").type(text);

    if (help) {
      cy.findByLabelText("Help text (optional)").type(help);
    }

    cy.findByLabelText("Value").type(value);

    if (conditions) {
      cy.findByLabelText("Conditions (optional)").select(conditions);
    }

    cy.findByTestId("flyout-2").within(() => {
      cy.findByRole("button", { name: "Save" }).click();
    });
  });
});

When("I save the list", () => {
  cy.findByTestId("flyout-1").within(() => {
    cy.findByRole("button", { name: "Save" }).click();
  });
});

Then("I see the options with hints", (table) => {
  const options = table.hashes();
  options.forEach(({ text, hint }) => {
    cy.findByLabelText(text);
    if (hint) {
      cy.findByText(hint);
    }
  });
});

Then("I see the options", (table) => {
  const options = table.hashes();
  options.forEach(({ text, hint }) => {
    cy.findByLabelText(text);

    if (hint) {
      cy.findByText(hint);
    }
  });
});

Then("I see the dropdown options", (table) => {
  const { labelText, options } = table.hashes()[0];
  const component = cy.findByLabelText(labelText);
  const optionsArray = options.split(",");
  optionsArray.forEach((option) => {
    component.select(option);
  });
});

Then("I see the typeahead options", (table) => {
  const { labelText, options } = table.hashes()[0];
  const component = cy.findByLabelText(labelText);
  const optionsArray = options.split(",");
  optionsArray.forEach((option) => {
    component.clear().type(option.substring(0, 3));
    cy.findByRole("option", { name: option });
  });
});

When("I go back to the designer", () => {
  cy.go("back");
});
When("I delete the list item {string}", (string) => {
  const cell = cy.findByText(string);
  cell.parent("tr").within(() => {
    cy.findByRole("cell", { name: "Delete" }).click();
  });
});
When("I edit the list item", (table) => {
  const { initialItem, text, help, value } = table.hashes()[0];
  const cell = cy.findByText(initialItem);
  cell.parent("tr").within(() => {
    cy.findByRole("cell", { name: "Edit" }).click();
  });

  if (text) {
    cy.findByLabelText("Item text").type(text);
  }

  if (help) {
    cy.findByLabelText("Help text (optional)").type(help);
  }

  if (value) {
    cy.findByLabelText("Value").type(value);
  }

  cy.findByTestId("flyout-2").within(() => {
    cy.findByRole("button", { name: "Save" }).click();
  });
});

Then("I see", (table) => {
  const options = table.hashes();
  options.forEach(({ text, hint }) => {
    cy.findByText(text);
    if (hint) {
      cy.findByText(hint);
    }
  });
});

Then("I see the field {string}", (string) => {
  cy.findByLabelText(string);
});
