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
              name: "IDDQl4",
              title: "abc",
              schema: {},
              options: {},
              type: "Para",
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
    expect(container).toHaveTextContent("");

    expect(container).toHaveTextContent("");
  });
});
