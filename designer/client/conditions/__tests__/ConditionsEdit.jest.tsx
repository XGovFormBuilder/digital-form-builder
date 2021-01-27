import React from "react";
import { render } from "@testing-library/react";
import ConditionsEdit from "../ConditionsEdit";
import sinon from "sinon";

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

  const data = {
    conditions: [condition, condition2],
    hasConditions: true,
    allInputs: sinon.stub(),
  };

  beforeEach(() => {
    data.allInputs.reset();
  });

  test("Renders edit links for each condition.", () => {
    data.allInputs.returns([]);

    const { getByText, queryByTestId } = render(<ConditionsEdit data={data} />);
    expect(getByText(condition.displayName)).toBeInTheDocument();
    expect(getByText(condition2.displayName)).toBeInTheDocument();
    expect(queryByTestId("edit-conditions")).toBeNull();
  });

  test("Clicking an edit link causes the edit view to be rendered and all other elements hidden.", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(3);
    listItems
      .at(1)
      .find("a")
      .simulate("click", { preventDefault: sinon.spy() });

    expect(wrapper.find("li").exists()).toBe(false);
    expect(wrapper.find("#edit-conditions").exists()).toBe(true);
    assertEditingInlineConditionsFlyout(wrapper, data, condition2, true);
  });

  test("Completion of editing causes the edit view to be hidden again .", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(3);
    listItems
      .at(1)
      .find("a")
      .simulate("click", { preventDefault: sinon.spy() });

    expect(wrapper.find("li").exists()).toBe(false);
    expect(wrapper.find("#edit-conditions").exists()).toBe(true);

    wrapper.instance().editFinished();

    const listItems2 = wrapper.find("li");
    expect(listItems2.exists()).toBe(true);
    expect(listItems2.length).toBe(3);
    expect(listItems2.at(0).find("a").text()).toBe(condition.displayName);
    expect(listItems2.at(1).find("a").text()).toBe(condition2.displayName);
    expect(wrapper.find("#edit-conditions").exists()).toBe(false);
  });

  test("Renders add new condition link if there are inputs available", () => {
    data.allInputs.returns([{}]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(3);
    const link = listItems.at(2).find("a");
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe("Add condition");
  });

  test("Renders no new condition message if there are no inputs available", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(3);
    expect(listItems.at(2).find("a").exists()).toBe(false);
    expect(listItems.at(2).text().trim()).toBe(
      "You cannot add any conditions as there are no available fields"
    );
  });

  test("Renders hidden inline condition flyout.", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    assertInlineConditionsFlyout(wrapper, data, false);
  });

  test("Clicking the add condition link causes the inline conditions flyout to be shown", () => {
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
    assertInlineConditionsFlyout(wrapper, data, true);
  });

  test("Cancellation or completion of inline conditions flyout causes the flyout to be hidden again", () => {
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
    assertInlineConditionsFlyout(wrapper, data, true);
    wrapper.instance().cancelInlineCondition();
    assertInlineConditionsFlyout(wrapper, data, false);
  });
});

describe("without existing conditions", () => {
  const data = {
    conditions: [],
    hasConditions: false,
    allInputs: sinon.stub(),
  };

  test("Renders no edit condition links.", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.length).toBe(1);
  });

  test("Renders add new condition link if inputs are available", () => {
    data.allInputs.returns([{}]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.length).toBe(1);
    const link = listItems.at(0).find("a");
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe("Add condition");
  });

  test("Renders no new condition message if there are no inputs available", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(1);
    expect(listItems.at(0).find("a").exists()).toBe(false);
    expect(listItems.at(0).text().trim()).toBe(
      "You cannot add any conditions as there are no available fields"
    );
  });

  test("Renders hidden inline condition flyout.", () => {
    data.allInputs.returns([]);
    const wrapper = render(<ConditionsEdit data={data} />);
    assertInlineConditionsFlyout(wrapper, data, false);
  });

  test("Clicking the add condition link causes the inline conditions flyout to be shown", () => {
    data.allInputs.returns([{}]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(1);
    expect(listItems.at(0).find("a").exists()).toBe(true);
    listItems
      .at(0)
      .find("a")
      .simulate("click", { preventDefault: sinon.spy() });
    assertInlineConditionsFlyout(wrapper, data, true);
  });

  test("Cancellation or completion of inline conditions flyout causes the flyout to be hidden again", () => {
    data.allInputs.returns([{}]);
    const wrapper = render(<ConditionsEdit data={data} />);
    const listItems = wrapper.find("li");
    expect(listItems.exists()).toBe(true);
    expect(listItems.length).toBe(1);
    expect(listItems.at(0).find("a").exists()).toBe(true);
    listItems
      .at(0)
      .find("a")
      .simulate("click", { preventDefault: sinon.spy() });
    assertInlineConditionsFlyout(wrapper, data, true);
    wrapper.instance().cancelInlineCondition();
    assertInlineConditionsFlyout(wrapper, data, false);
  });
});

function assertEditingInlineConditionsFlyout(
  wrapper,
  data,
  conditionModel,
  shown
) {
  const inlineConditions = wrapper.find("InlineConditions");
  expect(inlineConditions.exists()).toBe(true);
  expect(inlineConditions.prop("data")).toBe(data);
  expect(inlineConditions.prop("condition")).toBe(conditionModel);
  expect(inlineConditions.prop("conditionsChange")).toBe(
    wrapper.instance().editFinished
  );
  expect(inlineConditions.prop("cancelCallback")).toBe(
    wrapper.instance().editFinished
  );

  const flyout = inlineConditions.parent("Flyout");
  expect(flyout.exists()).toBe(true);
  expect(flyout.prop("show")).toBe(shown);
  expect(flyout.prop("title")).toBe("Edit Conditions");
  expect(flyout.prop("onHide")).toBe(wrapper.instance().editFinished);
}

function assertInlineConditionsFlyout(wrapper, data, shown) {
  const inlineConditions = wrapper.find("InlineConditions");
  expect(inlineConditions.exists()).toBe(true);
  expect(inlineConditions.prop("data")).toBe(data);
  expect(inlineConditions.prop("conditionsChange")).toBe(
    wrapper.instance().cancelInlineCondition
  );
  expect(inlineConditions.prop("cancelCallback")).toBe(
    wrapper.instance().cancelInlineCondition
  );

  const flyout = inlineConditions.parent("Flyout");
  expect(flyout.exists()).toBe(true);
  expect(flyout.prop("show")).toBe(shown);
  expect(flyout.prop("title")).toBe("Add Condition");
  expect(flyout.prop("onHide")).toBe(wrapper.instance().cancelInlineCondition);
}
