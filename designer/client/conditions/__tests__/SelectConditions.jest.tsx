import React from "react";
import { render } from "@testing-library/react";
import SelectConditions from "../SelectConditions";

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
      noFieldsHintText: "NoFieldsHintText",
    };
  });

  test("noFieldsAvailable hint text is rendered correctly", () => {
    const { getByText } = render(<SelectConditions {...props} />);

    const hint = "NoFieldsHintText";
    expect(getByText(hint)).toBeInTheDocument();
  });
});
