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
            type: "List",
          },
        ],
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
      return componentValue ? componentValue : initialState;
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
    const { container, getByText } = render(
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

    expect(
      getByText(
        "Tick this box if users do not need to complete this field to progress through the form"
      )
    ).toBeInTheDocument();
  });

  test("Content fields should not have optional checkbox", () => {
    const { container } = render(
      <TestComponentContextProvider
        dataValue={dataValue}
        componentValue={false}
      >
        <FieldEdit isContentField={true} />
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

    expect(container).not.toHaveTextContent(
      "Tick this box if users do not need to complete this field to progress through the form"
    );
  });
});
