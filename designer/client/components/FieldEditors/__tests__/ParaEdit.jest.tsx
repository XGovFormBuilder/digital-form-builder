import React, { useReducer } from "react";
import { render } from "@testing-library/react";
import { initI18n } from "../../../i18n";
import {
  ComponentContext,
  componentReducer,
  initComponentState,
} from "../../../reducers/component/componentReducer";
import { ParaEdit } from "../para-edit";
import { Data } from "@xgovformbuilder/model";
import { DataContext } from "../../../context";

initI18n();

describe("details-edit test", () => {
  function TestComponentWithContext({ children }) {
    let data = new Data({
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
      lists: [
        {
          name: "myList",
          title: "My list",
          type: "number",
          items: [{ text: "An item", description: "A hint", value: "12" }],
        },
        {
          name: "myOtherList",
          title: "",
          type: "string",
          items: [{ text: "An item", description: "A hint", value: "12" }],
        },
      ],
    }); //
    const dataValue = { data, save: jest.fn() };
    const initComponentValue = (initialState: any) => {
      return initialState;
    };
    const [state, dispatch] = useReducer(
      componentReducer,
      initComponentState({ component: data.pages[0].components[0] }),
      initComponentValue
    );
    return (
      <DataContext.Provider value={dataValue}>
        <ComponentContext.Provider value={{ state, dispatch }}>
          {children}
        </ComponentContext.Provider>
      </DataContext.Provider>
    );
  }

  describe("Text changes", () => {
    it("Should render with correct screen text", () => {
      const { container, debug } = render(
        <TestComponentWithContext>
          <ParaEdit context={ComponentContext}></ParaEdit>
        </TestComponentWithContext>
      );
      expect(container).toHaveTextContent(
        "Enter the text you want to show. You can apply basic HTML, such as text formatting and hyperlinks."
      );

      expect(container).toHaveTextContent(
        "Select a condition that determines whether to show the contents of this component. You can create and edit conditions on the Conditions screen."
      );
    });
  });
});
