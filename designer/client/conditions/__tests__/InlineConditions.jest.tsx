import React from "react";
import { render } from "@testing-library/react";
import InlineConditions from "../InlineConditions";

describe("SelectConditions", () => {
  let props: any;

  beforeEach(() => {
    props = {
      path: "/some-path",
      data: {
        inputsAccessibleAt: jest.fn().mockReturnValue([
          {
            label: "Something",
            name: "field1",
            type: "TextField",
          },
        ]),
        conditions: [],
        valuesFor: jest.fn().mockReturnValue({
          toStaticValues: jest.fn().mockReturnValue({ items: 1 }),
        }),
      },
      conditionsChange: jest.fn() as any,
      hints: [],
    };
  });

  test("addOrEditHint hint text is rendered correctly", () => {
    const { getByText } = render(<InlineConditions {...props} />);

    const hint =
      "Set the rules that determine the conditional behaviour in the form flow. For example, a question page might have a component for yes and no options that need two conditions - one to control what happens if a user selects yes and one for when a user selects no.";
    expect(getByText(hint)).toBeInTheDocument();
  });

  test("displayNameHint hint text is rendered correctly", () => {
    const { getByText } = render(<InlineConditions {...props} />);

    const hint =
      "Set a condition name that is easy to recognise. It appears as an option in the settings menus for the pages, components and links in a form.";
    expect(getByText(hint)).toBeInTheDocument();
  });

  test("when hint text is rendered correctly", () => {
    const { getByText } = render(<InlineConditions {...props} />);

    const hint =
      "Set when a condition might be met in the form. For example, when the form asks a question and the user selects Yes instead of No (yes=true).";
    expect(getByText(hint)).toBeInTheDocument();
  });
});
