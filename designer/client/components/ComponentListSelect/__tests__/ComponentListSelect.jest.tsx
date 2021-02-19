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
              type: "listRef",
              list: "myList",
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

  test("Lists all available lists", () => {
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
    expect(options).toHaveLength(2);

    const optionProps = [
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

  test("should display the correct title", () => {
    const { getByText } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    const text = "Select list";
    expect(getByText(text)).toBeInTheDocument();
  });

  test("should display correct help text", () => {
    const { getByText } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    const text =
      "Select a list to use for this field. You can either create a component list which is specific to this component, or a list that is available to other components from the Lists screen. You must save before creating a component list, or you can select an existing list.";
    expect(getByText(text)).toBeInTheDocument();
  });
});
