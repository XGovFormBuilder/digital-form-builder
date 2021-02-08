import React from "react";
import { fireEvent, render } from "@testing-library/react";
import ConditionsEdit from "../ConditionsEdit";
import { DataContext, FlyoutContext } from "../../context";
import { initI18n } from "../../i18n";

initI18n();

const flyoutValue = {
  increment: jest.fn(),
  decrement: jest.fn(),
  count: 0,
};
let data;

const customRender = (
  ui,
  { providerProps = { data, save: jest.fn() }, ...renderOptions }
) => {
  return render(
    <DataContext.Provider value={providerProps}>
      <FlyoutContext.Provider value={flyoutValue}>{ui}</FlyoutContext.Provider>
      <div id="portal-root" />
    </DataContext.Provider>,
    renderOptions
  );
};

describe("hint texts", () => {
  test("main hint text is correct", () => {
    const { getByText } = customRender(<ConditionsEdit />, {});

    const hint =
      "Set conditions for components and links to control the flow of a form. For example, a question page with a component for yes and no options could have link conditions based on which option a user selects.";
    expect(getByText(hint)).toBeInTheDocument();
  });

  test("no field hint test is correct", () => {
    const { getByText } = customRender(<ConditionsEdit />, {});
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

  let mockAllInputs = jest.fn();
  mockAllInputs.mockReturnValue([]);

  data = {
    conditions: [condition, condition2],
    hasConditions: true,
    allInputs: () => [],
  };

  beforeEach(() => {});

  test("Renders edit links for each condition and add new condition ", () => {
    const providerProps = {
      data,
      save: jest.fn(),
    };

    const { getByText, queryByTestId } = customRender(<ConditionsEdit />, {
      providerProps,
    });
    expect(getByText(condition.displayName)).toBeInTheDocument();
    expect(getByText(condition2.displayName)).toBeInTheDocument();
    expect(queryByTestId("edit-conditions")).toBeNull();
  });

  test("Clicking an edit link causes the edit view to be rendered and all other elements hidden", () => {
    const providerProps = {
      data,
      save: jest.fn(),
    };

    const { getByText, getByTestId } = customRender(<ConditionsEdit />, {
      providerProps,
    });
    const link = getByText(condition.displayName);
    fireEvent.click(link);
    expect(getByTestId("edit-conditions")).toBeTruthy();
  });
});

describe("without existing conditions", () => {
  const data = {
    conditions: [],
    hasConditions: false,
    allInputs: () => [],
  };

  test("Renders no edit condition links", () => {
    const providerProps = {
      data,
      save: jest.fn(),
    };
    const { queryByTestId, queryAllByTestId } = customRender(
      <ConditionsEdit />,
      {
        providerProps,
      }
    );

    const listItems = queryAllByTestId("conditions-list-items");
    expect(listItems.length).toBe(0);
    expect(queryByTestId("add-condition-link")).toBeNull();
  });

  test("Renders add new condition link if inputs are available", () => {
    const providerProps = {
      data: { ...data, allInputs: () => [{}] },
      save: jest.fn(),
    };
    const { queryByTestId } = customRender(<ConditionsEdit />, {
      providerProps,
    });

    expect(queryByTestId("add-condition-link")).toBeInTheDocument();
  });

  test("Renders no new condition message if there are no inputs available", () => {
    const providerProps = {
      data: { ...data, allInputs: () => [] },
      save: jest.fn(),
    };

    const { getByText } = customRender(<ConditionsEdit />, {
      providerProps,
    });

    const hint =
      "You cannot add a condition as no components are available. Create a component on a page in the form. You can then add a condition.";
    expect(getByText(hint)).toBeInTheDocument();
  });
});
