import React from "react";
import { fireEvent, render } from "@testing-library/react";
import ConditionsEdit from "../ConditionsEdit";
import { DataContext, FlyoutContext } from "../../context";

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

    const { getByText, queryByTestId, getByTestId } = customRender(
      <ConditionsEdit />,
      {
        providerProps,
      }
    );
    expect(getByText(condition.displayName)).toBeInTheDocument();
    expect(getByText(condition2.displayName)).toBeInTheDocument();
    expect(queryByTestId("edit-conditions")).toBeNull();
    expect(getByTestId("condition-none-available-message")).toBeInTheDocument();
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

  //FIXME:- test needs to be moved to InlineConditions and spying on onHide/editFinished.
  test.skip("Cancellation or completion of inline conditions flyout causes the flyout to be hidden again", () => {
    data.allInputs.returns([{}]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(3);
    expect(listItems.at(2).find("a").exists()).toBe(true);
    listItems
      .at(2)
      .find("a")
      .simulate("click", { preventDefault: sinon.spy() });
    //assertInlineConditionsFlyout(wrapper, data, true);
    wrapper.instance().cancelInlineCondition();
    //assertInlineConditionsFlyout(wrapper, data, false);
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

    const { getByTestId } = customRender(<ConditionsEdit />, {
      providerProps,
    });

    expect(getByTestId("condition-none-available-message")).toBeInTheDocument();
  });
});
