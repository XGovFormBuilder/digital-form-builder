import React, { useReducer } from "react";
import { render } from "@testing-library/react";
import userEvent, { TargetElement } from "@testing-library/user-event";

import { DataContext } from "../../../context";
import { Data } from "@xgovformbuilder/model";
import { ComponentListSelect } from "../component-list-select";
import {
  ComponentContext,
  componentReducer,
  initComponentState,
} from "../../../reducers/component/componentReducer";
import { ListsEditorContextProvider } from "../../../reducers/list/listsEditorReducer";
import { ListContextProvider } from "../../../reducers/listReducer";
import { i18n } from "../../../i18n/i18n";

describe("ComponentListSelect", () => {
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
        <ListsEditorContextProvider>
          <ComponentContext.Provider value={{ state, dispatch }}>
            <ListContextProvider>{children}</ListContextProvider>
          </ComponentContext.Provider>
        </ListsEditorContextProvider>
      </DataContext.Provider>
    );
  };

  test("Lists all available lists and the static list", () => {
    // - when
    const { container } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    const options = container.querySelectorAll("option");

    // - then
    expect(options).toHaveLength(3);

    const optionProps = [
      { value: "static", text: "abc" },
      { value: "myList", text: "My list" },
      { value: "myOtherList", text: "" },
    ];

    optionProps.forEach((optionProp, index) => {
      expect(options[index]).toHaveValue(optionProp.value);
      expect(options[index]).toHaveTextContent(optionProp.text);
    });
  });

  test("Selecting a different list changes the edit link", () => {
    // - when
    const { container } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    const select = container.querySelector("select") as TargetElement;
    userEvent.selectOptions(select, "myList");

    // - then
    const editLink = container.querySelector("a");
    expect(editLink).toHaveTextContent("Edit My list");
  });

  test("Create new static list shows when values is empty", () => {
    // - when
    const data = new Data({
      startPage: "",
      pages: [
        {
          title: "abc",
          path: "/abc",
          controller: "test",
          section: "test",
          components: [
            {
              name: "IDDQl4",
              title: "abc",
              schema: {},
              options: {
                required: true,
              },
              type: "RadiosField",
            },
          ],
        },
      ],
      lists: [],
      sections: [],
    });
    const dataValue = { data, save: jest.fn() };
    const { container } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    // - then
    const anchorLink = container.querySelector("a");
    expect(anchorLink).toHaveTextContent(i18n("list.static.newTitle"));
  });

  test("Force user to save for new components before allowing to create a static list", () => {
    // - when
    const componentProps = {
      selectedComponent: {
        name: "IDDQl4",
        title: "abc",
        schema: {},
        options: {
          required: true,
        },
        type: "RadiosField",
      },
      isNew: true,
    };
    const { container } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={componentProps}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    // - then
    expect(container).toHaveTextContent(i18n("list.static.saveFirst"));
  });
});
