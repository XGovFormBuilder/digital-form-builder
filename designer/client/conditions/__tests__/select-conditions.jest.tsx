import React from "react";
import { render } from "@testing-library/react";
import SelectConditions from "../select-conditions";
import { initI18n } from "../../i18n";

initI18n();

describe("SelectConditions", () => {
  let data: any;

  beforeEach(() => {
    data = {
      inputsAccessibleAt: jest.fn().mockReturnValue([]),
      allInputs: jest.fn().mockReturnValue([]),
      valuesFor: jest.fn(),
      hasConditions: false,
      conditions: [],
    };
  });

  it("renders noFieldsAvailable hint text", async () => {
    const props = {
      data,
      path: "",
      conditionsChange: jest.fn() as any,
      hints: [],
    };

    const noFieldsAvailableHint =
      "You cannot add any conditions as there are no components on the page you wish to link from. Add a component, such as an Input or a Selection field, and then add a condition.";

    const { getByText } = render(<SelectConditions {...props} />);
    const hint = await getByText(noFieldsAvailableHint);
    expect(hint).toBeInTheDocument();
  });
});
