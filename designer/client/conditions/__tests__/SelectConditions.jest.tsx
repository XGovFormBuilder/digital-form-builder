import React from "react";
import { render } from "@testing-library/react";
import SelectConditions from "../SelectConditions";
import { initI18n } from "../../i18n";

initI18n();

describe("SelectConditions", () => {
  let props;

  beforeEach(() => {
    props = {
      path: "/some-path",
      data: {
        inputsAccessibleAt: jest.fn().mockReturnValue([]),
      },
      conditionsChange: jest.fn() as any,
      hints: [],
    };
  });

  test("noFieldsAvailable hint text is rendered correctly", () => {
    const { getByText } = render(<SelectConditions {...props} />);

    const hint =
      "You cannot add a condition as no components are available. Create a component on a page in the form. You can then add a condition.";
    expect(getByText(hint)).toBeInTheDocument();
  });
});
