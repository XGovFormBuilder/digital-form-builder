import React from "react";
import { render } from "@testing-library/react";
import { ComponentContext } from "../../../reducers/component/componentReducer";
import { SidebarEdit } from "../sidebar-edit";
import { DataContext } from "../../../context";

describe("sidebar edit", () => {
  function TestComponentWithContext({ children }) {
    let data = {
      pages: [
        {
          title: "First page",
          path: "/first-page",
          components: [
            {
              name: "UjidZI",
              options: {},
              type: "Sidebar",
              content: "this is a side bar",
              schema: {},
            },
          ],
        },
      ],
      conditions: [],
    };
    const dataValue = { data, save: jest.fn() };
    const compContextValue = {
      state: { selectedComponent: {} },
      dispatch: jest.fn(),
    };
    return (
      <DataContext.Provider value={dataValue}>
        <ComponentContext.Provider value={compContextValue}>
          {children}
        </ComponentContext.Provider>
      </DataContext.Provider>
    );
  }

  it("Should render with correct screen text", () => {
    const { container } = render(
      <TestComponentWithContext>
        <SidebarEdit context={ComponentContext}></SidebarEdit>
      </TestComponentWithContext>
    );
    expect(container).toHaveTextContent(
      "Enter the text you want to show. You can apply basic HTML, such as text formatting and hyperlinks."
    );

    expect(container).toHaveTextContent(
      "Select which side of the page you wish to have the sidebar on."
    );

    expect(container).toHaveTextContent(
      "Select a condition that determines whether to show the contents of this component. You can create and edit conditions from the Conditions screen."
    );
  });
});
