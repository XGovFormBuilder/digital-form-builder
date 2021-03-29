import React from "react";
import { render, fireEvent } from "@testing-library/react";
import LinkCreate from "../link-create";

describe("LinkCreate", () => {
  let data: any;

  beforeEach(() => {
    data = {
      inputsAccessibleAt: jest.fn().mockReturnValue([]),
      allInputs: jest.fn().mockReturnValue([]),
      valuesFor: jest.fn(),
      hasConditions: false,
      conditions: [],
      pages: [
        {
          title: "First page",
          path: "/first-page",
          components: [],
        },
        {
          title: "Summary",
          path: "/summary",
          controller: "./pages/summary.js",
          components: [],
        },
      ],
    };
  });

  test("hint texts are rendered correctly", () => {
    const hint1 =
      "You can add links between different pages and set conditions for links to control the page that loads next. For example, a question page with a component for yes and no options could have link conditions based on which option a user selects.";
    const hint2 =
      "To add a link in the main screen, click and hold the title of a page and drag a line to the title of the page you want to link it to. To edit a link, select its line.";

    const { getByText } = render(<LinkCreate data={data} />);
    expect(getByText(hint1)).toBeInTheDocument();
    expect(getByText(hint2)).toBeInTheDocument();
  });

  test("cannot add condition hint is rendered correctly", () => {
    const hint =
      "You cannot add any conditions as there are no components on the page you wish to link from. Add a component, such as an Input or a Selection field, and then add a condition.";

    const { getByLabelText, getByText } = render(<LinkCreate data={data} />);

    fireEvent.change(getByLabelText("From"), {
      target: { value: data.pages[0].path },
    });

    expect(getByText(hint)).toBeInTheDocument();
  });
});
