import React from "react";
import { fireEvent, render } from "@testing-library/react";
import ConditionsEdit from "../ConditionsEdit";
import { DataContext, FlyoutContext } from "../../context";
import { FormDefinition } from "@xgovformbuilder/model";

const flyoutValue = {
  increment: jest.fn(),
  decrement: jest.fn(),
  count: 0,
};
const data: FormDefinition = {
  pages: [
    { path: "/1", next: [{ path: "/2" }] },
    {
      path: "/2",
      components: [{ type: "TextField", name: "field1", title: "Something" }],
      next: [{ path: "/3" }],
    },
    {
      path: "/3",
      components: [
        { type: "TextField", name: "field2", title: "Something else" },
        { type: "TextField", name: "field3", title: "beep" },
      ],
    },
  ],
  conditions: [],
};

const dataProviderProps = {
  data,
  save: jest.fn(),
};

const customRender = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <DataContext.Provider value={providerProps ?? dataProviderProps}>
      <FlyoutContext.Provider value={flyoutValue}>{ui}</FlyoutContext.Provider>
      <div id="portal-root" />
    </DataContext.Provider>,
    renderOptions
  );
};

describe("hint texts", () => {
  test("main hint text is correct", () => {
    const { getByText } = customRender(<ConditionsEdit />);

    const hint =
      "Set conditions for components and links to control the flow of a form. For example, a question page with a component for yes and no options could have link conditions based on which option a user selects.";
    expect(getByText(hint)).toBeInTheDocument();
  });

  test("no field hint test is correct", () => {
    const { getByText } = customRender(<ConditionsEdit />, {
      providerProps: { data: { pages: [], conditions: [] }, save: jest.fn() },
    });
    const hint =
      "You cannot add a condition as no components are available. Create a component on a page in the form. You can then add a condition.";
    expect(getByText(hint)).toBeInTheDocument();
  });
});

describe("with existing conditions", () => {
  const condition = {
    name: "abdefg",
    displayName: "My condition",
    value: "badgers",
  };
  const condition2 = {
    name: "abdefgh",
    displayName: "My condition 2",
    value: "badgers again",
  };

  const providerData = {
    data: {
      ...data,
      conditions: [condition, condition2],
    },
    save: jest.fn(),
  };

  const props = {
    providerProps: providerData,
  };

  test("Renders edit links for each condition and add new condition ", () => {
    const { getByText, queryByTestId } = customRender(<ConditionsEdit />, {
      ...props,
    });
    expect(getByText(condition.displayName)).toBeInTheDocument();
    expect(getByText(condition2.displayName)).toBeInTheDocument();
    expect(queryByTestId("edit-conditions")).toBeNull();
  });

  test("Clicking an edit link causes the edit view to be rendered and all other elements hidden", () => {
    const { getByText, getByTestId } = customRender(<ConditionsEdit />, {
      ...props,
    });
    const link = getByText(condition.displayName);
    fireEvent.click(link);
    expect(getByTestId("edit-conditions")).toBeTruthy();
  });
});

describe("without existing conditions", () => {
  const providerData = {
    data: {
      ...data,
      conditions: [],
    },
    save: jest.fn(),
  };

  const props = {
    providerProps: providerData,
  };

  test("Renders no edit condition links", () => {
    const { queryAllByTestId } = customRender(<ConditionsEdit />, props);

    const listItems = queryAllByTestId("conditions-list-items");
    expect(listItems.length).toBe(0);
  });

  test("Renders add new condition link if inputs are available", () => {
    const { queryByTestId } = customRender(<ConditionsEdit />, props);

    expect(queryByTestId("add-condition-link")).toBeInTheDocument();
  });

  test("Renders no new condition message if there are no inputs available", () => {
    const { getByText } = customRender(<ConditionsEdit />, {
      providerProps: { data: { pages: [], conditions: [] }, save: jest.fn() },
    });

    const hint =
      "You cannot add a condition as no components are available. Create a component on a page in the form. You can then add a condition.";
    expect(getByText(hint)).toBeInTheDocument();
  });
});
