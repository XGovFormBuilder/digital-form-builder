import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import {
  assertCheckboxInput,
  assertClasses,
  assertDiv,
  assertLabel,
  assertLink,
  assertSpan,
  assertText,
} from "./helpers/element-assertions";
import sinon from "sinon";
import InlineConditionsEdit from "../client/conditions/inline-conditions-edit";
import {
  Condition,
  ConditionsModel,
  ConditionField,
  ConditionValue,
  getOperatorNames,
} from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, describe, suite, test } = lab;

const isEqualToOperator = "is";

suite("Editing inline conditions", () => {
  const selectFieldOperators = getOperatorNames("SelectField");
  let exitCallback;
  let saveCallback;
  const values = [
    { value: "value1", text: "Value 1" },
    { value: "value2", text: "Value 2" },
  ];
  const fields = {
    field1: {
      label: "Something",
      name: "field1",
      type: "TextField",
      values: undefined,
    },
    field2: {
      label: "Something else",
      name: "field2",
      type: "TextField",
      values: undefined,
    },
    field3: {
      label: "Another thing",
      name: "field3",
      type: "SelectField",
      values: values,
    },
  };
  const firstCondition = new Condition(
    new ConditionField(
      fields.field1.name,
      fields.field1.type,
      fields.field1.label
    ),
    isEqualToOperator,
    new ConditionValue("M")
  );
  let conditions;

  beforeEach(() => {
    conditions = new ConditionsModel();
    conditions.add(firstCondition);
    exitCallback = sinon.spy();
    saveCallback = sinon.spy();
  });

  describe("editing conditions", () => {
    test("Edit panel is displayed for a single condition", () => {
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      assertEditPanel(wrapper, [{ condition: "'Something' is 'M'" }]);
      expect(saveCallback.called).to.equal(false);
    });

    test("Clicking the edit link for a single condition causes the field definition inputs to be pre-populated correctly", () => {
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );
      wrapper.find("#condition-0-edit").simulate("click");

      assertFieldDefinitionSection(wrapper, fields, true, firstCondition, 0);
      expect(saveCallback.called).to.equal(false);
    });

    test("Clicking the edit link for a subsequent condition causes the field definition inputs to be pre-populated correctly", () => {
      const condition = new Condition(
        new ConditionField(
          fields.field2.name,
          fields.field2.type,
          fields.field2.label
        ),
        isEqualToOperator,
        new ConditionValue("N"),
        "and"
      );
      conditions.add(condition);
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );
      wrapper.find("#condition-1-edit").simulate("click");

      assertFieldDefinitionSection(wrapper, fields, true, condition, 1);
      expect(saveCallback.called).to.equal(false);
    });

    test("Save condition callback results in an updated condition string and returns the users to an updated edit panel", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );
      assertEditPanel(wrapper, [
        { condition: "'Something' is 'M'" },
        { condition: "and 'Something else' is 'N'" },
      ]);
      wrapper.find("#condition-1-edit").simulate("click");

      wrapper
        .instance()
        .saveCondition(
          new Condition(
            new ConditionField(
              fields.field1.name,
              fields.field1.type,
              fields.field1.label
            ),
            "is not",
            new ConditionValue("Badger"),
            "or"
          )
        );

      assertEditPanel(wrapper, [
        { condition: "'Something' is 'M'" },
        { condition: "or 'Something' is not 'Badger'" },
      ]);
      expect(saveCallback.calledOnce).to.equal(true);
      expect(saveCallback.firstCall.args[0]).to.equal(conditions);
    });

    test("Grouping conditions combines them into a single condition which can be split but not edited", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      expect(wrapper.find("#condition-0").exists()).to.equal(true);
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-1")
        .simulate("change", { target: { value: "1", checked: true } });

      assertEditPanel(wrapper, [
        {
          condition: "'Something' is 'M'",
          selected: true,
        },
        { condition: "and 'Something else' is 'N'", selected: true },
      ]);

      wrapper.find("#group-conditions").simulate("click");

      assertEditPanel(wrapper, [
        {
          condition: "('Something' is 'M' and 'Something else' is 'N')",
          grouped: true,
        },
      ]);
      expect(saveCallback.calledOnce).to.equal(true);
      expect(saveCallback.firstCall.args[0]).to.equal(conditions);
    });

    test("should not group non-consecutive conditions", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field3.name,
            fields.field3.type,
            fields.field3.label
          ),
          selectFieldOperators[0],
          new ConditionValue(values[0].value, values[0].text),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      expect(wrapper.find("#condition-0").exists()).to.equal(true);
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-2")
        .simulate("change", { target: { value: "2", checked: true } });

      const expectedConditions = [
        { condition: "'Something' is 'M'", selected: true },
        { condition: "and 'Something else' is 'N'" },
        { condition: "and 'Another thing' is 'Value 1'", selected: true },
      ];
      assertEditPanel(wrapper, expectedConditions);

      wrapper.find("#group-conditions").simulate("click");
      assertEditPanel(
        wrapper,
        expectedConditions,
        "Error: Please select consecutive items to group"
      );
      expect(saveCallback.calledOnce).to.equal(false);
    });

    test("should group multiple consecutive condition groups", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "or"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field3.name,
            fields.field3.type,
            fields.field3.label
          ),
          selectFieldOperators[0],
          new ConditionValue(values[0].value, values[0].text),
          "and"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field3.name,
            fields.field3.type,
            fields.field3.label
          ),
          selectFieldOperators[0],
          new ConditionValue(values[0].value, values[0].text),
          "or"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("Y"),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      expect(wrapper.find("#condition-0").exists()).to.equal(true);
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-1")
        .simulate("change", { target: { value: "1", checked: true } });
      wrapper
        .find("#condition-3")
        .simulate("change", { target: { value: "3", checked: true } });
      wrapper
        .find("#condition-4")
        .simulate("change", { target: { value: "4", checked: true } });

      assertEditPanel(wrapper, [
        { condition: "'Something' is 'M'", selected: true },
        { condition: "or 'Something else' is 'N'", selected: true },
        { condition: "and 'Another thing' is 'Value 1'" },
        { condition: "or 'Another thing' is 'Value 1'", selected: true },
        { condition: "and 'Something else' is 'Y'", selected: true },
      ]);

      wrapper.find("#group-conditions").simulate("click");

      assertEditPanel(wrapper, [
        {
          condition: "('Something' is 'M' or 'Something else' is 'N')",
          grouped: true,
        },
        { condition: "and 'Another thing' is 'Value 1'" },
        {
          condition:
            "or ('Another thing' is 'Value 1' and 'Something else' is 'Y')",
          grouped: true,
        },
      ]);
      expect(saveCallback.calledOnce).to.equal(true);
      expect(saveCallback.firstCall.args[0]).to.equal(conditions);
    });

    test("splitting grouped conditions returns them to their original components", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      expect(wrapper.find("#condition-0").exists()).to.equal(true);
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-1")
        .simulate("change", { target: { value: "1", checked: true } });

      wrapper.find("#group-conditions").simulate("click");

      assertEditPanel(wrapper, [
        {
          condition: "('Something' is 'M' and 'Something else' is 'N')",
          grouped: true,
        },
      ]);

      wrapper.find("#condition-0-split").simulate("click");

      assertEditPanel(wrapper, [
        { condition: "'Something' is 'M'" },
        { condition: "and 'Something else' is 'N'" },
      ]);
      expect(saveCallback.calledTwice).to.equal(true);
      expect(saveCallback.secondCall.args[0]).to.equal(conditions);
    });

    test("removing selected conditions", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field3.name,
            fields.field3.type,
            fields.field3.label
          ),
          selectFieldOperators[0],
          new ConditionValue(values[0].value, values[0].text),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-2")
        .simulate("change", { target: { value: "2", checked: true } });

      wrapper.find("#remove-conditions").simulate("click");

      assertEditPanel(wrapper, [{ condition: "'Something else' is 'N'" }]);
      expect(saveCallback.calledOnce).to.equal(true);
      expect(saveCallback.firstCall.args[0]).to.equal(conditions);
    });

    test("Should deselect conditions", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field3.name,
            fields.field3.type,
            fields.field3.label
          ),
          selectFieldOperators[0],
          new ConditionValue(values[0].value, values[0].text),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0" } });

      expect(wrapper.find("#remove-conditions").exists()).to.equal(false);
      expect(saveCallback.calledOnce).to.equal(false);
    });

    test("removing grouped conditions removes everything in the group", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field3.name,
            fields.field3.type,
            fields.field3.label
          ),
          selectFieldOperators[0],
          new ConditionValue(values[0].value, values[0].text),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      expect(wrapper.find("#condition-0").exists()).to.equal(true);
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-1")
        .simulate("change", { target: { value: "1", checked: true } });

      wrapper.find("#group-conditions").simulate("click");

      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper.find("#remove-conditions").simulate("click");

      assertEditPanel(wrapper, [{ condition: "'Another thing' is 'Value 1'" }]);
      expect(saveCallback.calledTwice).to.equal(true);
      expect(saveCallback.secondCall.args[0]).to.equal(conditions);
    });

    test("removing last condition triggers exitCallback", () => {
      conditions.add(
        new Condition(
          new ConditionField(
            fields.field2.name,
            fields.field2.type,
            fields.field2.label
          ),
          isEqualToOperator,
          new ConditionValue("N"),
          "and"
        )
      );
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );

      expect(wrapper.find("#condition-0").exists()).to.equal(true);
      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper
        .find("#condition-1")
        .simulate("change", { target: { value: "1", checked: true } });

      wrapper.find("#group-conditions").simulate("click");

      wrapper
        .find("#condition-0")
        .simulate("change", { target: { value: "0", checked: true } });
      wrapper.find("#remove-conditions").simulate("click");

      expect(saveCallback.calledTwice).to.equal(true);
      expect(saveCallback.secondCall.args[0]).to.equal(conditions);
    });

    test("Cancelling from editing an individual condition returns user to the add conditions view", () => {
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );
      wrapper.find("#condition-0-edit").simulate("click");
      wrapper.find("#cancel-edit-inline-conditions-link").simulate("click");

      expect(exitCallback.calledOnce).to.equal(true);
    });

    test("Cancelling from edit view returns user to the add condition view", () => {
      const wrapper = shallow(
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={saveCallback}
          exitCallback={exitCallback}
        />
      );
      wrapper.find("#cancel-edit-inline-conditions-link").simulate("click");

      expect(exitCallback.calledOnce).to.equal(true);
    });
  });
});

function assertFieldDefinitionSection(
  wrapper,
  fields,
  hasConditions,
  condition,
  editingIndex
) {
  const inlineConditionsDefinition = wrapper.find("InlineConditionsDefinition");
  expect(inlineConditionsDefinition.exists()).to.equal(true);
  expect(inlineConditionsDefinition.prop("expectsCoordinator")).to.equal(
    hasConditions && editingIndex !== 0
  );
  expect(inlineConditionsDefinition.prop("fields")).to.equal(fields);
  expect(inlineConditionsDefinition.prop("condition")).to.equal(condition);
  expect(inlineConditionsDefinition.prop("saveCallback")).to.equal(
    wrapper.instance().saveCondition
  );
  expect(Object.keys(inlineConditionsDefinition.props()).length).to.equal(4);
}

function assertEditPanel(wrapper, conditions, editingError) {
  const editConditionsPanel = wrapper.find("#edit-conditions");
  expect(editConditionsPanel.exists()).to.equal(true);

  const fieldSet = editConditionsPanel.find("fieldset");

  const legend = fieldSet.find("legend");
  expect(legend.text()).to.equal("Amend conditions");

  assertLink(
    wrapper.find("#cancel-edit-inline-conditions-link"),
    "cancel-edit-inline-conditions-link",
    "Finished editing"
  );
  expect(wrapper.find("#cancel-inline-conditions-link").exists()).to.equal(
    false
  );

  if (editingError) {
    const editingErrorSection = fieldSet.find("#conditions-error");
    assertText(editingErrorSection, editingError);
    assertClasses(editingErrorSection, ["govuk-error-message"]);
  }

  const checkboxesDiv = fieldSet.find("#editing-checkboxes");
  assertClasses(checkboxesDiv, ["govuk-checkboxes"]);
  expect(checkboxesDiv.children().length).to.equal(conditions.length);
  conditions.forEach((condition, index) => {
    const checkboxDiv = checkboxesDiv.children().at(index);
    assertDiv(checkboxDiv, ["govuk-checkboxes__item"]);
    expect(checkboxDiv.children().length).to.equal(3);

    assertCheckboxInput({
      wrapper: checkboxDiv.children().at(0),
      id: `condition-${index}`,
      value: index,
      checked: condition.selected || "",
    });

    assertLabel(checkboxDiv.children().at(1), condition.condition);
    const actions = checkboxDiv.children().at(2);
    assertSpan(actions);
    expect(actions.prop("id")).to.equal(`condition-${index}-actions`);
    let expectedActions = 3;
    if (index === 0) {
      expectedActions--;
    }
    if (index === conditions.length - 1) {
      expectedActions--;
    }
    expect(actions.children().length).to.equal(expectedActions);
    if (condition.grouped) {
      assertLink(
        actions.children().at(0).find(`#condition-${index}-split`),
        `condition-${index}-split`,
        "Split"
      );
    } else {
      assertLink(
        actions.children().at(0).find(`#condition-${index}-edit`),
        `condition-${index}-edit`,
        "<EditIcon />"
      );
    }
    if (index !== 0) {
      assertLink(
        actions.children().at(1).find(`#condition-${index}-move-earlier`),
        `condition-${index}-move-earlier`,
        "<MoveUpIcon />"
      );
    }
    if (index !== conditions.length - 1) {
      const actionIndex = index === 0 ? 1 : 2;
      assertLink(
        actions
          .children()
          .at(actionIndex)
          .find(`#condition-${index}-move-later`),
        `condition-${index}-move-later`,
        "<MoveDownIcon />"
      );
    }
  });

  const groupAndRemove = wrapper.find("#group-and-remove");
  expect(groupAndRemove.exists()).to.equal(true);
  const selectedConditions = conditions.filter(
    (condition) => condition.selected
  ).length;
  // If one child is selected then only the remove link is displayed, if 2 are selected then both group and remove are displayed.
  expect(groupAndRemove.children().length).to.equal(
    Math.min(selectedConditions, 2)
  );
  if (selectedConditions.length >= 2) {
    assertLink(groupAndRemove.children().at(0), "group-conditions", "Group");
    assertLink(groupAndRemove.children().at(1), "remove-conditions", "Remove");
  } else if (selectedConditions.length === 1) {
    assertLink(groupAndRemove.children().at(0), "remove-conditions", "Remove");
  }
}
