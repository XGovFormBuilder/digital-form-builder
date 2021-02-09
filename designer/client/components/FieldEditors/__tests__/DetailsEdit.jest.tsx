import React, { useReducer } from "react";
import { render } from "@testing-library/react";
import { initI18n } from "../../../i18n";
import {
  ComponentContext,
  componentReducer,
  initComponentState,
} from "../../../reducers/component/componentReducer";
import DetailsEdit from "../details-edit";
import { Data } from "@xgovformbuilder/model";

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
              options: {
                required: true,
              },
              type: "RadiosField",
              values: {
                type: "static",
                items: [
                  { label: "My item", value: "12", children: [] },
                  {
                    label: "Item 2",
                    hint: "My hint",
                    value: "11",
                    condition: "Abcewdad",
                    children: [],
                  },
                  {
                    label: "Item 3",
                    value: "13",
                    children: [{ type: "TextField" }],
                  },
                ],
              },
            },
          ],
        },
      ],
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
    const initComponentValue = (initialState: any) => {
      return initialState;
    };
    const [state, dispatch] = useReducer(
      componentReducer,
      initComponentState({ component: data.pages[0].components[0] }),
      initComponentValue
    );
    return (
      <ComponentContext.Provider value={{ state, dispatch }}>
        {children}
      </ComponentContext.Provider>
    );
  }

  describe("Text changes", () => {
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
        "Enter the text you want to show when users expand the title. You can apply basic formatting, such as text formatting and hyperlinks."
      );
    });
  });
});
