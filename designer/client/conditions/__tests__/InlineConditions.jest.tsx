import React from "react";
import { render } from "@testing-library/react";
import InlineConditions from "../InlineConditions";
import { DataContext } from "../../context/DataContext";

test("Strings are rendered correctly", () => {
  let props = {
    path: "/some-path",
    conditionsChange: jest.fn() as any,
    hints: [],
  };

  const data = {
    pages: [
      { path: "/1", next: [{ path: "/2" }] },
      {
        path: "/2",
        components: [{ type: "TextField", name: "field1", title: "Something" }],
        next: [{ path: "/3" }],
      },
      {
        path: "/3",
        components: [
          { type: "TextField", name: "field2", title: "Something else" },
          { type: "TextField", name: "field3", title: "beep" },
        ],
      },
    ],
    conditions: [],
  };

  const { getByText } = render(
    <DataContext.Provider value={{ data, save: jest.fn() }}>
      <InlineConditions {...props} />
    </DataContext.Provider>
  );

  const addOrEditHint =
    "Set the rules that determine the conditional behaviour in the form flow. For example, a question page might have a component for yes and no options that need two conditions - one to control what happens if a user selects yes and one for when a user selects no.";
  expect(getByText(addOrEditHint)).toBeInTheDocument();

  const displayNameHint =
    "Set a condition name that is easy to recognise. It appears as an option in the settings menus for the pages, components and links in a form.";
  expect(getByText(displayNameHint)).toBeInTheDocument();

  const hint =
    "Set when a condition might be met in the form. For example, when the form asks a question and the user selects Yes instead of No (yes=true).";
  expect(getByText(hint)).toBeInTheDocument();
});
