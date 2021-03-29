import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { assertLink, assertSelectInput } from "./helpers/element-assertions";
import sinon from "sinon";
import InlineConditionsDefinition from "../client/conditions/InlineConditionsDefinition";
import {
  Condition,
  ConditionField,
  ConditionRef,
  ConditionValue,
  getOperatorNames,
} from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, beforeEach, describe, suite, test } = lab;

suite("Inline conditions definition section", () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    valuesFor: sinon.stub(),
  };
  const textFieldOperators = getOperatorNames("TextField");
  const numberFieldOperators = getOperatorNames("NumberField");
  const isEqualToOperator = "is";
  const path = "/";

  describe("when fields are present", () => {
    const selectFieldOperators = getOperatorNames("SelectField");
    let fields;
    let expectedFields;
    const values = [
      { value: "value1", display: "Value 1" },
      { value: "value2", display: "Value 2" },
    ];
    let saveCallback;

    before(() => {
      fields = [
        { name: "field1", title: "Something", type: "TextField" },
        { name: "field2", title: "Something else", type: "TextField" },
        { name: "field3", title: "Another thing", type: "SelectField" },
        { name: "field4", title: "A number", type: "NumberField" },
        { name: "condition1", title: "A condition", type: "Condition" },
      ];
      expectedFields = {
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
        field4: {
          label: "A number",
          name: "field4",
          type: "NumberField",
          values: undefined,
        },
        condition1: {
          label: "A condition",
          name: "condition1",
          type: "Condition",
        },
      };
      data.inputsAccessibleAt.withArgs(path).returns(fields);
      data.valuesFor.returns(undefined);
      data.valuesFor.withArgs(fields[2]).returns({ items: values });
    });

    beforeEach(() => {
      saveCallback = sinon.spy();
    });

    describe("adding conditions", () => {
      const value = new ConditionValue("M");
      const value2 = new ConditionValue("N");

      test("Only the field input is displayed initially for the first condition", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        expect(wrapper.find("#cond-coordinator-group").exists()).to.equal(
          false
        );
        expect(wrapper.find("#condition-definition-inputs").exists()).to.equal(
          true
        );
        expect(wrapper.find("#cond-field").exists()).to.equal(true);
        assertFieldInputPresent(wrapper, fields);
        assertOperatorInputNotPresent(wrapper);
        assertValueInputNotPresent(wrapper);
        assertNoSaveConditionLink(wrapper);
      });

      test("Only the coordinator input is displayed initially for later conditions", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator
            fields={expectedFields}
          />
        );
        expect(wrapper.find("#cond-coordinator-group").exists()).to.equal(true);
        expect(wrapper.find("#condition-definition-inputs").exists()).to.equal(
          false
        );
        assertFieldInputNotPresent(wrapper);
        assertOperatorInputNotPresent(wrapper);
        assertValueInputNotPresent(wrapper);
        assertNoSaveConditionLink(wrapper);
      });

      test("Selecting a field displays the relevant operators", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[0].name } });

        assertFieldInputPresent(wrapper, fields, fields[0].name);

        assertOperatorInputPresent(wrapper, textFieldOperators);
        assertValueInputNotPresent(wrapper);

        assertNoSaveConditionLink(wrapper);
      });

      describe("for a field which does not have an options list", () => {
        textFieldOperators.forEach((operator) => {
          test(
            "selecting an operator creates a text value input for " + operator,
            () => {
              const wrapper = shallow(
                <InlineConditionsDefinition
                  saveCallback={saveCallback}
                  expectsCoordinator={false}
                  fields={expectedFields}
                />
              );
              wrapper
                .find("#cond-field")
                .simulate("change", { target: { value: fields[0].name } });
              wrapper
                .find("#cond-operator")
                .simulate("change", { target: { value: operator } });

              assertFieldInputPresent(wrapper, fields, fields[0].name);
              assertOperatorInputPresent(wrapper, textFieldOperators, operator);
              assertInlineConditionsDefinitionValueComponent(wrapper, operator);
              assertNoSaveConditionLink(wrapper);
            }
          );
        });

        test("populating a value makes the 'save condition' link appear", () => {
          const wrapper = shallow(
            <InlineConditionsDefinition
              saveCallback={saveCallback}
              expectsCoordinator={false}
              fields={expectedFields}
            />
          );
          fillConditionInputs(
            wrapper,
            fields[0].name,
            textFieldOperators[0],
            value
          );
          assertFieldInputPresent(wrapper, fields, fields[0].name);
          assertOperatorInputPresent(
            wrapper,
            textFieldOperators,
            textFieldOperators[0]
          );
          assertInlineConditionsDefinitionValueComponent(
            wrapper,
            textFieldOperators[0],
            value
          );
          assertSaveConditionLink(wrapper);
        });

        test("removing a value makes the 'save condition' link disappear", () => {
          const wrapper = shallow(
            <InlineConditionsDefinition
              saveCallback={saveCallback}
              expectsCoordinator={false}
              fields={expectedFields}
            />
          );
          fillConditionInputs(
            wrapper,
            fields[0].name,
            textFieldOperators[0],
            value
          );
          wrapper.instance().updateValue(undefined);

          assertFieldInputPresent(wrapper, fields, fields[0].name);
          assertOperatorInputPresent(
            wrapper,
            textFieldOperators,
            textFieldOperators[0]
          );
          assertInlineConditionsDefinitionValueComponent(
            wrapper,
            textFieldOperators[0]
          );
          assertNoSaveConditionLink(wrapper);
        });

        test("Clicking the 'save condition' link stores the condition", () => {
          const wrapper = shallow(
            <InlineConditionsDefinition
              saveCallback={saveCallback}
              expectsCoordinator={false}
              fields={expectedFields}
            />
          );
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], value);

          expect(saveCallback.calledOnce).to.equal(true);
          expect(saveCallback.firstCall.args[0]).to.equal(
            new Condition(
              new ConditionField(
                fields[0].name,
                fields[0].type,
                fields[0].title
              ),
              textFieldOperators[0],
              value
            )
          );
        });
      });

      describe("for a field which has an options list", () => {
        let field;

        before(() => {
          field = fields[2];
        });

        selectFieldOperators.forEach((operator) => {
          test(`selecting an operator creates a select input for ${operator}`, () => {
            const wrapper = shallow(
              <InlineConditionsDefinition
                saveCallback={saveCallback}
                expectsCoordinator={false}
                fields={expectedFields}
              />
            );
            wrapper
              .find("#cond-field")
              .simulate("change", { target: { value: field.name } });
            wrapper
              .find("#cond-operator")
              .simulate("change", { target: { value: operator } });

            assertFieldInputPresent(wrapper, fields, field.name);
            assertOperatorInputPresent(wrapper, selectFieldOperators, operator);
            assertInlineConditionsDefinitionValueComponent(wrapper, operator);
          });
        });

        values.forEach((value) => {
          test(`selecting value '${value.text}' makes the 'save condition' link appear`, () => {
            const wrapper = shallow(
              <InlineConditionsDefinition
                saveCallback={saveCallback}
                expectsCoordinator={false}
                fields={expectedFields}
              />
            );
            fillConditionInputs(
              wrapper,
              field.name,
              selectFieldOperators[0],
              value
            );

            assertFieldInputPresent(wrapper, fields, field.name);
            assertOperatorInputPresent(
              wrapper,
              selectFieldOperators,
              selectFieldOperators[0]
            );
            assertInlineConditionsDefinitionValueComponent(
              wrapper,
              selectFieldOperators[0],
              value
            );
            assertSaveConditionLink(wrapper);
          });
        });

        test("changing a value leaves the 'save condition' link in place", () => {
          const wrapper = shallow(
            <InlineConditionsDefinition
              saveCallback={saveCallback}
              expectsCoordinator={false}
              fields={expectedFields}
            />
          );
          fillConditionInputs(
            wrapper,
            field.name,
            selectFieldOperators[0],
            values[0]
          );
          const value = new ConditionValue(values[1].value, values[1].text);
          wrapper.instance().updateValue(value);

          assertFieldInputPresent(wrapper, fields, field.name);
          assertOperatorInputPresent(
            wrapper,
            selectFieldOperators,
            selectFieldOperators[0]
          );
          assertInlineConditionsDefinitionValueComponent(
            wrapper,
            selectFieldOperators[0],
            value
          );
          assertSaveConditionLink(wrapper);
        });

        test("Removing a value removes the 'save condition' link", () => {
          const wrapper = shallow(
            <InlineConditionsDefinition
              saveCallback={saveCallback}
              expectsCoordinator={false}
              fields={expectedFields}
            />
          );
          fillConditionInputs(
            wrapper,
            field.name,
            selectFieldOperators[0],
            new ConditionValue(values[0].value, values[0].text)
          );
          wrapper.instance().updateValue(undefined);

          assertFieldInputPresent(wrapper, fields, field.name);
          assertOperatorInputPresent(
            wrapper,
            selectFieldOperators,
            selectFieldOperators[0]
          );
          assertInlineConditionsDefinitionValueComponent(
            wrapper,
            selectFieldOperators[0]
          );
          assertNoSaveConditionLink(wrapper);
        });

        test("Clicking the 'save condition' link stores the condition", () => {
          const wrapper = shallow(
            <InlineConditionsDefinition
              saveCallback={saveCallback}
              expectsCoordinator={false}
              fields={expectedFields}
            />
          );
          const expectedValue = new ConditionValue(
            values[0].value,
            values[0].text
          );
          saveCondition(
            wrapper,
            field.name,
            selectFieldOperators[0],
            expectedValue
          );

          expect(saveCallback.calledOnce).to.equal(true);
          expect(saveCallback.firstCall.args[0]).to.equal(
            new Condition(
              new ConditionField(field.name, field.type, field.title),
              selectFieldOperators[0],
              expectedValue
            )
          );
        });
      });

      test("Change field erases operator and value if neither is relevant anymore", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[3].name } });
        wrapper
          .find("#cond-operator")
          .simulate("change", { target: { value: "is at least" } });
        const value = new ConditionValue("10");
        wrapper.instance().updateValue(value);

        assertFieldInputPresent(wrapper, fields, fields[3].name);
        assertOperatorInputPresent(
          wrapper,
          numberFieldOperators,
          "is at least"
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          "is at least",
          value
        );

        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[2].name } });

        assertFieldInputPresent(wrapper, fields, fields[2].name);
        assertOperatorInputPresent(wrapper, selectFieldOperators);
        assertValueInputNotPresent(wrapper);
        assertNoSaveConditionLink(wrapper);

        wrapper
          .find("#cond-operator")
          .simulate("change", { target: { value: selectFieldOperators[0] } });

        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          selectFieldOperators[0]
        );
        assertNoSaveConditionLink(wrapper);
      });

      test("Change field to an existing condition displays save condition link", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[3].name } });
        wrapper
          .find("#cond-operator")
          .simulate("change", { target: { value: "is at least" } });
        const value = new ConditionValue("10");
        wrapper.instance().updateValue(value);

        assertFieldInputPresent(wrapper, fields, fields[3].name);
        assertOperatorInputPresent(
          wrapper,
          numberFieldOperators,
          "is at least"
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          "is at least",
          value
        );

        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[4].name } });

        assertFieldInputPresent(wrapper, fields, fields[4].name);
        assertOperatorInputNotPresent(wrapper);
        assertValueInputNotPresent(wrapper);
        assertSaveConditionLink(wrapper);
      });

      test("Clicking the 'save condition' link with an existing condition selected stores a reference to the selected condition", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[4].name } });
        wrapper.find("#save-condition").simulate("click");

        expect(saveCallback.calledOnce).to.equal(true);
        expect(saveCallback.firstCall.args[0]).to.equal(
          new ConditionRef(fields[4].name, fields[4].title)
        );
      });

      test("Clicking the 'save condition' link when adding a condition as a subsequent condition includes the coordinator", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-coordinator")
          .simulate("change", { target: { value: "or" } });
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[4].name } });
        wrapper.find("#save-condition").simulate("click");

        expect(saveCallback.calledOnce).to.equal(true);
        expect(saveCallback.firstCall.args[0]).to.equal(
          new ConditionRef(fields[4].name, fields[4].title, "or")
        );
      });

      test("Change field erases value but keeps operator if operator is still relevant", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[0].name } });
        wrapper
          .find("#cond-operator")
          .simulate("change", { target: { value: isEqualToOperator } });
        wrapper.instance().updateValue(value);

        assertFieldInputPresent(wrapper, fields, fields[0].name);
        assertOperatorInputPresent(
          wrapper,
          textFieldOperators,
          isEqualToOperator
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          isEqualToOperator,
          value
        );
        assertSaveConditionLink(wrapper);

        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[2].name } });

        assertFieldInputPresent(wrapper, fields, fields[2].name);
        assertOperatorInputPresent(
          wrapper,
          selectFieldOperators,
          selectFieldOperators[0]
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          selectFieldOperators[0]
        );
      });

      test("Clearing field erases all values", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: fields[0].name } });
        wrapper
          .find("#cond-operator")
          .simulate("change", { target: { value: textFieldOperators[0] } });
        wrapper.instance().updateValue(value);

        assertFieldInputPresent(wrapper, fields, fields[0].name);
        assertOperatorInputPresent(
          wrapper,
          textFieldOperators,
          textFieldOperators[0]
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          textFieldOperators[0],
          value
        );

        wrapper
          .find("#cond-field")
          .simulate("change", { target: { value: undefined } });

        assertFieldInputPresent(wrapper, fields);
      });

      test("Adding subsequent conditions", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-coordinator")
          .simulate("change", { target: { value: "and" } });
        saveCondition(wrapper, fields[1].name, textFieldOperators[1], value2);

        expect(saveCallback.calledOnce).to.equal(true);
        expect(saveCallback.firstCall.args[0]).to.equal(
          new Condition(
            new ConditionField(fields[1].name, fields[1].type, fields[1].title),
            textFieldOperators[1],
            value2,
            "and"
          )
        );
      });

      test("Changing to a blank coordinator", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-coordinator")
          .simulate("change", { target: { value: "and" } });
        wrapper
          .find("#cond-coordinator")
          .simulate("change", { target: { value: "" } });

        assertConditionCoordinatorInput(wrapper);
        assertNoFieldsGroup(wrapper);
      });

      test("Changing to an undefined coordinator", () => {
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator
            fields={expectedFields}
          />
        );
        wrapper
          .find("#cond-coordinator")
          .simulate("change", { target: { value: "and" } });
        wrapper
          .find("#cond-coordinator")
          .simulate("change", { target: { value: undefined } });

        assertConditionCoordinatorInput(wrapper);
        assertNoFieldsGroup(wrapper);
      });

      test("Amending the first condition ", () => {
        const condition = new Condition(
          new ConditionField(fields[1].name, fields[1].type, fields[1].title),
          textFieldOperators[1],
          value2
        );
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator={false}
            fields={expectedFields}
            condition={condition}
          />
        );
        assertNoConditionCoordinatorInput(wrapper);

        assertFieldInputPresent(wrapper, fields, fields[1].name);
        assertOperatorInputPresent(
          wrapper,
          textFieldOperators,
          textFieldOperators[1]
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          textFieldOperators[1],
          value2
        );
        assertSaveConditionLink(wrapper);
      });

      test("Amending a later condition ", () => {
        const condition = new Condition(
          new ConditionField(fields[1].name, fields[1].type, fields[1].title),
          textFieldOperators[1],
          value2,
          "and"
        );
        const wrapper = shallow(
          <InlineConditionsDefinition
            saveCallback={saveCallback}
            expectsCoordinator
            fields={expectedFields}
            condition={condition}
          />
        );

        assertConditionCoordinatorInput(wrapper, "and");
        assertFieldInputPresent(wrapper, fields, fields[1].name);
        assertOperatorInputPresent(
          wrapper,
          textFieldOperators,
          textFieldOperators[1]
        );
        assertInlineConditionsDefinitionValueComponent(
          wrapper,
          textFieldOperators[1],
          value2
        );
        assertSaveConditionLink(wrapper);
      });
    });
  });
});

function assertOperatorInputPresent(wrapper, operators, expectedOperator) {
  const expectedFieldOptions = operators.map((operator) => ({
    value: operator,
    text: operator,
  }));
  expectedFieldOptions.unshift({ text: "" });
  assertSelectInput({
    wrapper: wrapper.find("#cond-operator"),
    id: "cond-operator",
    expectedFieldOptions,
    expectedValue: expectedOperator || "",
  });
}

function assertOperatorInputNotPresent(wrapper) {
  expect(wrapper.find("#cond-operator").exists()).to.equal(false);
}

function assertInlineConditionsDefinitionValueComponent(
  wrapper,
  operator,
  expected
) {
  const definitionValueNode = wrapper.find("InlineConditionsDefinitionValue");
  expect(definitionValueNode.exists()).to.equal(true);
  expect(definitionValueNode.prop("value")).to.equal(expected);
  expect(definitionValueNode.prop("operator")).to.equal(operator);
  expect(definitionValueNode.prop("updateValue")).to.equal(
    wrapper.instance().updateValue
  );
}

function assertValueInputNotPresent(wrapper) {
  expect(wrapper.find("#cond-value").exists()).to.equal(false);
}

function assertFieldInputPresent(wrapper, fields, expectedField?) {
  const expectedFieldOptions = fields.map((field) => ({
    value: field.name,
    text: field.title,
  }));
  expectedFieldOptions.unshift({ text: "" });
  assertSelectInput({
    wrapper: wrapper.find("#cond-field"),
    id: "cond-field",
    expectedFieldOptions,
    expectedValue: expectedField || "",
  });
}

function assertFieldInputNotPresent(wrapper) {
  expect(wrapper.find("#cond-field").exists()).to.equal(false);
}

function assertNoFieldsGroup(wrapper) {
  expect(wrapper.find("#condition-definition-inputs").exists()).to.equal(false);
}

function assertSaveConditionLink(wrapper) {
  assertLink(wrapper.find("#save-condition"), "save-condition", "Add");
}

function assertNoSaveConditionLink(wrapper) {
  expect(wrapper.find("#save-condition").exists()).to.equal(false);
}

function assertConditionCoordinatorInput(wrapper, expectedValue) {
  const conditionCoordinatorGroup = wrapper.find("#cond-coordinator-group");
  expect(conditionCoordinatorGroup.hasClass("govuk-form-group")).to.equal(true);
  const expectedFieldOptions = [
    { text: "" },
    { value: "and", text: "And" },
    { value: "or", text: "Or" },
  ];
  assertSelectInput({
    wrapper: conditionCoordinatorGroup.find("select"),
    id: "cond-coordinator",
    expectedFieldOptions,
    expectedValue: expectedValue || "",
  });
}

function assertNoConditionCoordinatorInput(wrapper) {
  expect(wrapper.find("#cond-coordinator").exists()).to.equal(false);
}

function saveCondition(wrapper, fieldName, operator, value) {
  fillConditionInputs(wrapper, fieldName, operator, value);
  wrapper.find("#save-condition").simulate("click");
}

function fillConditionInputs(wrapper, fieldName, operator, value) {
  wrapper
    .find("#cond-field")
    .simulate("change", { target: { value: fieldName } });
  wrapper
    .find("#cond-operator")
    .simulate("change", { target: { value: operator } });
  wrapper.instance().updateValue(value);
}
