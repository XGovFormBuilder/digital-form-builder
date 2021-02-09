import React, { useReducer } from "react";
import { render } from "@testing-library/react";
import { Data } from "@xgovformbuilder/model";
import { DataContext } from "../context";
import {
  ComponentContext,
  componentReducer,
  initComponentState,
} from "../reducers/component/componentReducer";
import { FieldEdit } from "../field-edit";
import { initI18n } from "../i18n";

describe("Field Edit", () => {
  beforeEach(() => {
    initI18n();
  });

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
  });
  const dataValue = { data, save: jest.fn() };

  const TestComponentContextProvider = ({
    children,
    dataValue,
    componentValue,
  }) => {
    const initComponentValue = (initialState: any) => {
      return !!componentValue ? componentValue : initialState;
    };
    const [state, dispatch] = useReducer(
      componentReducer,
      initComponentState({ component: dataValue.data.pages[0].components[0] }),
      initComponentValue
    );
    return (
      <DataContext.Provider value={dataValue}>
        <ComponentContext.Provider value={{ state, dispatch }}>
          {children}
        </ComponentContext.Provider>
      </DataContext.Provider>
    );
  };

  test("Help text changes", () => {
    // - when
    const { container } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <FieldEdit />
      </TestComponentContextProvider>
    );
    expect(container).toHaveTextContent(
      "Enter the name to show for this component"
    );

    expect(container).toHaveTextContent(
      "Enter the description to show for this component"
    );

    expect(container).toHaveTextContent(
      "Tick this box if you do not want the title to show on the page"
    );

    expect(container).toHaveTextContent(
      "This is generated automatically and does not show on the page. Only change it if you are using an integration that requires you to, for example GOV.UK Notify. It must not contain spaces."
    );

    expect(container).toHaveTextContent(
      "Tick this box if the user does not need to complete this field to progress through the form."
    );
  });
});
