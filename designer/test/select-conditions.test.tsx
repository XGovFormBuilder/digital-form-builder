import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { assertLink } from "./helpers/element-assertions";
import sinon from "sinon";
import SelectConditions from "../client/conditions/select-conditions";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, beforeEach, describe, suite, test } = lab;

function assertNoFieldsText(wrapper) {
  expect(wrapper.exists(".conditions")).to.equal(true);
  expect(
    wrapper.find(".conditions").find(".govuk-body").text().trim()
  ).to.equal("You cannot add any conditions as there are no available fields");
  expect(wrapper.exists("InlineConditions")).to.equal(false);
  expect(wrapper.exists("#select-condition")).to.equal(false);
}

function assertInlineConditionFlyoutNotDisplayed(wrapper) {
  const inlineConditions = wrapper.find("InlineConditions");
  expect(inlineConditions.exists()).to.equal(true);
  const inlineConditionsFlyout = inlineConditions.parent("Flyout");
  expect(inlineConditionsFlyout.exists()).to.equal(true);
  expect(inlineConditionsFlyout.prop("show")).to.equal(false);
}

suite.skip("Select conditions", () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    allInputs: sinon.stub(),
    valuesFor: sinon.stub(),
    hasConditions: false,
    conditions: [],
  };
  const path = "/";
  let conditionsChange;

  beforeEach(() => {
    conditionsChange = sinon.spy();
  });

  describe("when there are already conditions defined", () => {
    const conditions = [
      {
        name: "badger",
        displayName: "Monkeys love badgers",
        value: "field1 is a thing",
      },
      {
        name: "badger2",
        displayName: "another thing",
        value: "field4 is another thing",
      },
    ];

    beforeEach(() => {
      data.hasConditions = true;
      data.conditions = conditions;
    });

    test("render returns placeholder message when there is an empty fields list", () => {
      data.inputsAccessibleAt.withArgs(path).returns([]);
      data.valuesFor.returns(undefined);
      assertNoFieldsText(
        shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        )
      );
      expect(conditionsChange.called).to.equal(false);
    });

    describe("when fields are present", () => {
      let fields;

      beforeEach(() => {
        fields = [
          { propertyPath: "field1", title: "Something", type: "TextField" },
          {
            propertyPath: "field2",
            title: "Something else",
            type: "TextField",
          },
          {
            propertyPath: "field3",
            title: "Another thing",
            type: "SelectField",
          },
        ];

        data.inputsAccessibleAt.withArgs(path).returns(fields);
        data.allInputs.returns([]);
      });

      test("should display the select conditions list and a link to allow inline creation", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        const conditionsSection = wrapper.find(".conditions");
        expect(conditionsSection.exists()).to.equal(true);

        const conditionHeaderGroup = conditionsSection.find(
          "#conditions-header-group"
        );
        expect(conditionHeaderGroup.find("label").text()).to.equal(
          "Conditions (optional)"
        );
        assertInlineConditionFlyoutNotDisplayed(wrapper);

        const selectConditions = conditionsSection.find("#select-condition");
        expect(selectConditions.exists()).to.equal(true);

        expect(selectConditions.props()).to.equal({
          id: "select-condition",
          name: "cond-select",
          value: "",
          items: [
            { children: [""], value: "" },
            { children: ["Monkeys love badgers"], value: "badger" },
            { children: ["another thing"], value: "badger2" },
          ],
          label: {
            className: "govuk-label--s",
            children: ["Select a condition"],
          },
          required: false,
          onChange: wrapper.instance().onChangeConditionSelection,
        });

        assertLink(
          conditionsSection.find("#inline-conditions-link"),
          "inline-conditions-link",
          "Define a new condition"
        );
      });

      test("should display all inputs when no path provided", () => {
        data.inputsAccessibleAt.returns([]);
        data.allInputs.returns(fields);
        const wrapper = shallow(
          <SelectConditions data={data} conditionsChange={conditionsChange} />
        );
        const conditionsSection = wrapper.find(".conditions");
        expect(conditionsSection.exists()).to.equal(true);
        const conditionHeaderGroup = conditionsSection.find(
          "#conditions-header-group"
        );
        expect(conditionHeaderGroup.find("label").text()).to.equal(
          "Conditions (optional)"
        );
        assertInlineConditionFlyoutNotDisplayed(wrapper);

        const selectConditions = conditionsSection.find("#select-condition");
        expect(selectConditions.exists()).to.equal(true);
        expect(selectConditions.props()).to.equal({
          id: "select-condition",
          name: "cond-select",
          value: "",
          items: [
            { children: [""], value: "" },
            { children: ["Monkeys love badgers"], value: "badger" },
            { children: ["another thing"], value: "badger2" },
          ],
          label: {
            className: "govuk-label--s",
            children: ["Select a condition"],
          },
          required: false,
          onChange: wrapper.instance().onChangeConditionSelection,
        });

        assertLink(
          conditionsSection.find("#inline-conditions-link"),
          "inline-conditions-link",
          "Define a new condition"
        );
      });

      test("should default the selected condition when one is provided", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            selectedCondition={conditions[1].name}
            conditionsChange={conditionsChange}
          />
        );
        const conditionsSection = wrapper.find(".conditions");
        expect(conditionsSection.exists()).to.equal(true);
        const conditionHeaderGroup = conditionsSection.find(
          "#conditions-header-group"
        );
        expect(conditionHeaderGroup.find("label").text()).to.equal(
          "Conditions (optional)"
        );
        assertInlineConditionFlyoutNotDisplayed(wrapper);

        const selectConditions = conditionsSection.find("#select-condition");
        expect(selectConditions.exists()).to.equal(true);

        expect(selectConditions.props()).to.equal({
          id: "select-condition",
          name: "cond-select",
          value: "badger2",
          items: [
            { children: [""], value: "" },
            { children: ["Monkeys love badgers"], value: "badger" },
            { children: ["another thing"], value: "badger2" },
          ],
          label: {
            className: "govuk-label--s",
            children: ["Select a condition"],
          },
          required: false,
          onChange: wrapper.instance().onChangeConditionSelection,
        });

        assertLink(
          conditionsSection.find("#inline-conditions-link"),
          "inline-conditions-link",
          "Define a new condition"
        );
      });

      test("Clicking the define condition link should trigger the inline view to define a condition", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        expect(wrapper.find("#select-condition").exists()).to.equal(true);

        wrapper.find("#inline-conditions-link").simulate("click");

        assertInlineConditionsComponentDisplayed(wrapper, data, path);
      });

      test("cancel inline condition should re-display the select conditions section with blank condition", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.find("#inline-conditions-link").simulate("click");
        assertInlineConditionsComponentDisplayed(wrapper, data, path);
        wrapper.instance().onCancelInlineCondition();

        const selectConditions = wrapper.find("#select-condition");
        expect(selectConditions.exists()).to.equal(true);
        expect(selectConditions.props()).to.equal({
          id: "select-condition",
          name: "cond-select",
          value: "",
          items: [
            { children: [""], value: "" },
            { children: ["Monkeys love badgers"], value: "badger" },
            { children: ["another thing"], value: "badger2" },
          ],
          label: {
            className: "govuk-label--s",
            children: ["Select a condition"],
          },
          required: false,
          onChange: wrapper.instance().onChangeConditionSelection,
        });

        assertInlineConditionFlyoutNotDisplayed(wrapper);
      });

      test("cancel inline condition should re-display the select conditions section with specified condition selected", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            selectedCondition={conditions[1].name}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.find("#inline-conditions-link").simulate("click");
        assertInlineConditionsComponentDisplayed(wrapper, data, path);
        wrapper.instance().onCancelInlineCondition();

        const selectConditions = wrapper.find("#select-condition");
        expect(selectConditions.exists()).to.equal(true);
        expect(selectConditions.props()).to.equal({
          id: "select-condition",
          name: "cond-select",
          value: "badger2",
          items: [
            { children: [""], value: "" },
            { children: ["Monkeys love badgers"], value: "badger" },
            { children: ["another thing"], value: "badger2" },
          ],
          label: {
            className: "govuk-label--s",
            children: ["Select a condition"],
          },
          required: false,
          onChange: wrapper.instance().onChangeConditionSelection,
        });

        assertInlineConditionFlyoutNotDisplayed(wrapper);
        expect(conditionsChange.called).to.equal(false);
      });

      test("Conditions change is called when a condition is selected", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.instance().render = sinon.stub();
        wrapper.find("#select-condition").prop("onChange")({
          target: { value: "badger2" },
        });

        expect(conditionsChange.calledOnceWith("badger2")).to.equal(true);
      });

      test("Conditions change is not called if saveState is called without a selected condition", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.instance().setState({ something: "badgers" });

        expect(conditionsChange.called).to.equal(false);
      });

      test("Saving an inline condition should cause the conditionsChange callback to be called and the inline flyout to be hidden", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.find("#inline-conditions-link").simulate("click");
        assertInlineConditionsComponentDisplayed(wrapper, data, path);
        const condition = "myCondition";
        wrapper.instance().onSaveInlineCondition(condition);

        expect(conditionsChange.calledOnceWith(condition)).to.equal(true);
        expect(wrapper.find("#select-condition").exists()).to.equal(true);
        assertInlineConditionFlyoutNotDisplayed(wrapper);
      });
    });
  });

  describe("when there are no conditions defined", () => {
    beforeEach(() => {
      data.hasConditions = false;
      data.conditions = [];
    });

    test("render returns placeholder message is an empty fields list", () => {
      data.inputsAccessibleAt.withArgs(path).returns([]);
      data.valuesFor.returns(undefined);
      assertNoFieldsText(
        shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        )
      );
      expect(conditionsChange.called).to.equal(false);
    });

    describe("when fields are present", () => {
      let fields;
      const values = [
        { value: "value1", display: "Value 1" },
        { value: "value2", display: "Value 2" },
      ];

      before(() => {
        fields = [
          { propertyPath: "field1", title: "Something", type: "TextField" },
          {
            propertyPath: "field2",
            title: "Something else",
            type: "TextField",
          },
          {
            propertyPath: "field3",
            title: "Another thing",
            type: "SelectField",
          },
        ];
        data.inputsAccessibleAt.withArgs(path).returns(fields);
        data.valuesFor.returns(undefined);
        data.valuesFor
          .withArgs(fields[2])
          .returns({ toStaticValues: () => ({ items: values }) });
      });

      test("should display a link to allow inline creation", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        const conditionsSection = wrapper.find(".conditions");
        expect(conditionsSection.exists()).to.equal(true);
        const conditionHeaderGroup = conditionsSection.find(
          "#conditions-header-group"
        );
        expect(conditionHeaderGroup.find("label").text()).to.equal(
          "Conditions (optional)"
        );
        assertInlineConditionFlyoutNotDisplayed(wrapper);
        const selectConditions = conditionsSection.find("#select-condition");
        expect(selectConditions.exists()).to.equal(false);
        assertLink(
          conditionsSection.find("#inline-conditions-link"),
          "inline-conditions-link",
          "Define a new condition"
        );
        assertInlineConditionFlyoutNotDisplayed(wrapper);
      });

      test("Clicking the define conditions link displays the inline conditions component", () => {
        data.valuesFor.returns(undefined);
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.find("#inline-conditions-link").simulate("click");

        assertInlineConditionsComponentDisplayed(wrapper, data, path);
      });

      test("cancel inline condition should keep the inline conditions section displayed", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.find("#inline-conditions-link").simulate("click");
        assertInlineConditionsComponentDisplayed(wrapper, data, path);
        wrapper.instance().onCancelInlineCondition();

        expect(wrapper.find("#select-condition").exists()).to.equal(false);
        assertInlineConditionFlyoutNotDisplayed(wrapper);
      });

      test("if the path property changes to a route without fields then the condition section is replaced by no fields text", () => {
        const path2 = "/2";
        data.inputsAccessibleAt.withArgs(path2).returns([]);
        data.valuesFor.returns(undefined);
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        expect(wrapper.find("InlineConditions").exists()).to.equal(true);
        wrapper.setProps({ path: path2 });
        assertNoFieldsText(wrapper);
      });

      test("if the path property changes from a route with fields then the condition section appears", () => {
        const path2 = "/2";
        data.inputsAccessibleAt.withArgs(path2).returns([]);
        data.valuesFor.returns(undefined);
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path2}
            conditionsChange={conditionsChange}
          />
        );
        expect(wrapper.exists("InlineConditions")).to.equal(false);
        wrapper.setProps({ path: path });
        expect(wrapper.exists("InlineConditions")).to.equal(true);
      });

      test("Saving an inline condition should cause the conditionsChange callback to be called and the inline flyout to be hidden", () => {
        const wrapper = shallow(
          <SelectConditions
            data={data}
            path={path}
            conditionsChange={conditionsChange}
          />
        );
        wrapper.find("#inline-conditions-link").simulate("click");
        assertInlineConditionsComponentDisplayed(wrapper, data, path);
        const condition = "myCondition";
        wrapper.instance().onSaveInlineCondition(condition);

        expect(conditionsChange.calledOnceWith(condition)).to.equal(true);
        expect(wrapper.find("#select-condition").exists()).to.equal(true);
        assertInlineConditionFlyoutNotDisplayed(wrapper);
      });
    });
  });
});

function assertInlineConditionsComponentDisplayed(wrapper, data, path) {
  const inlineConditionsComponent = wrapper.find("InlineConditions");
  expect(inlineConditionsComponent.exists()).to.equal(true);
  expect(inlineConditionsComponent.prop("data")).to.equal(data);
  expect(inlineConditionsComponent.prop("path")).to.equal(path);
  expect(inlineConditionsComponent.prop("conditionsChange")).to.equal(
    wrapper.instance().onSaveInlineCondition
  );
  expect(inlineConditionsComponent.prop("cancelCallback")).to.equal(
    wrapper.instance().onCancelInlineCondition
  );
  expect(Object.keys(inlineConditionsComponent.props()).length).to.equal(4);
  const inlineConditionsFlyout = inlineConditionsComponent.parent("Flyout");
  expect(inlineConditionsFlyout.exists()).to.equal(true);
  expect(inlineConditionsFlyout.prop("show")).to.equal(true);
}
