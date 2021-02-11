import React from "react";
import { render } from "@testing-library/react";
import { initI18n } from "../../../i18n";
import { ComponentContext } from "../../../reducers/component/componentReducer";
import DetailsEdit from "../details-edit";

initI18n();

describe("details-edit", () => {
  function TestComponentWithContext({ children }) {
    return (
      <ComponentContext.Provider
        value={{ state: { selectedComponent: {} }, dispatch: jest.fn() }}
      >
        {children}
      </ComponentContext.Provider>
    );
  }

  it("Should render with correct screen text", () => {
    const { container } = render(
      <TestComponentWithContext>
        <DetailsEdit context={ComponentContext}></DetailsEdit>
      </TestComponentWithContext>
    );

    expect(container).toHaveTextContent(
      "Enter the name to show for this component"
    );

    expect(container).toHaveTextContent(
      "Enter the text you want to show when users expand the title. You can apply basic HTML, such as text formatting and hyperlinks."
    );
  });
});
