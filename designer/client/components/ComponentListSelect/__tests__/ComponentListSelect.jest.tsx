import React, { useReducer } from "react";
import { render } from "@testing-library/react";
import userEvent, { TargetElement } from "@testing-library/user-event";
import { DataContext } from "../../../context";
import { Data } from "@xgovformbuilder/model";
import { ComponentListSelect } from "../ComponentListSelect";
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
            list: "myList",
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
    expect(options).toHaveLength(3);

    const optionProps = [
      { value: "myList", text: "My list" },
      { value: "myOtherList", text: "" },
    ];

    optionProps.forEach((optionProp, index) => {
      expect(options[index + 1]).toHaveValue(optionProp.value);
      expect(options[index + 1]).toHaveTextContent(optionProp.text);
    });
  });

  test("Selecting a different list changes the edit link", () => {
    // - when
    const { container, getByText } = render(
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
    expect(getByText("Edit My list")).toBeInTheDocument();
  });

  test("should render strings correctly", () => {
    const { getByText } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <ComponentListSelect />
      </TestComponentContextProvider>
    );

    const title = "Select list";
    const help =
      "Select a list to use for this field. You can either create a component list which is specific to this component, or a list that is available to other components from the Lists screen. You must save before creating a component list, or you can select an existing list.";
    const addNew = "Add a new list";
    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(help)).toBeInTheDocument();
    expect(getByText(addNew)).toBeInTheDocument();
  });
});
