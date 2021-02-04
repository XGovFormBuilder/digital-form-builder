import React from "react";
import { render } from "@testing-library/react";
import LinkCreate from "../link-create";
import { initI18n } from "../i18n";

initI18n();

describe("LinkCreate", () => {
  let data: any;

  beforeEach(() => {
    data = {
      inputsAccessibleAt: jest.fn().mockReturnValue([]),
      allInputs: jest.fn().mockReturnValue([]),
      valuesFor: jest.fn(),
      hasConditions: false,
      conditions: [],
      pages: [],
    };
  });

  it("renders hint texts correctly", () => {
    const hint1 =
      "You can add links between different pages and set conditions for links to control the page that loads next. For example, a question page with a component for yes and no options could have link conditions based on which option a user selects.";
    const hint2 =
      "To add a link in the form screen, draw a line between pages. To edit a link, select its line.";

    const { getByText } = render(<LinkCreate data={data} />);
    expect(getByText(hint1)).toBeInTheDocument();
    expect(getByText(hint2)).toBeInTheDocument();
  });
});
