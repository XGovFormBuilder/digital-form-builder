import React from "react";
import { shallow } from "enzyme";
import * as Lab from "@hapi/lab";
import * as Code from "@hapi/code";
import {
  assertRequiredTextInput,
  assertSelectInput,
} from "./helpers/element-assertions";
import sinon from "sinon";
import InlineConditionsDefinitionValue from "../client/conditions/inline-conditions-definition-values";
import {
  ConditionValue,
  dateTimeUnits,
  dateUnits,
  RelativeTimeValue,
  timeUnits,
  relativeDateOrTimeOperatorNames,
} from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test } = lab;

suite("Inline conditions definition value inputs", () => {
  const values = [
    { value: "value1", label: "Value 1" },
    { value: "value2", label: "Value 2" },
  ];
  const selectedValues = values.map(
    (it) => new ConditionValue(it.value, it.label)
  );
  let updateValueCallback;

  beforeEach(() => {
    updateValueCallback = sinon.spy();
  });

  test("should display a text input for fields without custom mappings or options", () => {
    const fieldDef = {
      label: "Something",
      name: "field1",
      type: "TextField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        value={new ConditionValue("my-value")}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    assertRequiredTextInput({
      wrapper: wrapper.find("input"),
      id: "cond-value",
      expectedValue: "my-value",
    });
  });

  test("Inputting a text value should call update value", () => {
    const fieldDef = {
      label: "Something",
      name: "field1",
      type: "TextField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    wrapper
      .find("#cond-value")
      .simulate("change", { target: { value: "My thing" } });
    expect(updateValueCallback.calledOnce).to.equal(true);
    expect(updateValueCallback.firstCall.args[0]).to.equal(
      new ConditionValue("My thing")
    );
  });

  test("Inputting a blank text value should call update value with undefined", () => {
    const fieldDef = {
      label: "Something",
      name: "field1",
      type: "TextField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    wrapper.find("#cond-value").simulate("change", { target: { value: "  " } });
    expect(updateValueCallback.calledOnce).to.equal(true);
    expect(updateValueCallback.firstCall.args[0]).to.equal(undefined);
  });

  test("should display a select input for fields without custom mappings and with options", () => {
    const fieldDef = {
      label: "Something",
      name: "field1",
      values: values,
      type: "SelectField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        value={selectedValues[0]}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    const expectedFieldOptions = values.map((it) => ({
      text: it.label,
      value: it.value,
    }));
    expectedFieldOptions.unshift({ text: "" });
    assertSelectInput({
      wrapper: wrapper.find("select"),
      id: "cond-value",
      expectedFieldOptions,
      expectedValue: values[0].value,
    });
  });

  test("selecting a value from the select list should call update value", () => {
    const fieldDef = {
      label: "Something",
      name: "field1",
      values: values,
      type: "SelectField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    wrapper
      .find("#cond-value")
      .simulate("change", { target: { value: values[0].value } });
    expect(updateValueCallback.calledOnce).to.equal(true);
    expect(updateValueCallback.firstCall.args[0]).to.equal(selectedValues[0]);
  });

  test("Should correctly compare boolean string to boolean value", () => {
    const values = [
      { value: true, label: "Value 1" },
      { value: false, label: "Value 2" },
    ];
    const selectedValues = values.map(
      (it) => new ConditionValue(String(it.value), it.label)
    );

    const fieldDef = {
      label: "Something",
      name: "field1",
      values: values,
      type: "SelectField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    wrapper
      .find("#cond-value")
      .simulate("change", { target: { value: "true" } });
    expect(updateValueCallback.calledOnce).to.equal(true);
    expect(updateValueCallback.firstCall.args[0]).to.equal(selectedValues[0]);
  });

  test("Should correctly compare number string to number value", () => {
    const values = [
      { value: 42, label: "Value 1" },
      { value: 43, label: "Value 2" },
    ];
    const selectedValues = values.map(
      (it) => new ConditionValue(String(it.value), it.label)
    );

    const fieldDef = {
      label: "Something",
      name: "field1",
      values: values,
      type: "SelectField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    wrapper.find("#cond-value").simulate("change", { target: { value: "42" } });
    expect(updateValueCallback.calledOnce).to.equal(true);
    expect(updateValueCallback.firstCall.args[0]).to.equal(selectedValues[0]);
  });

  test("selecting a blank value from the select list should call update value with undefined", () => {
    const fieldDef = {
      label: "Something",
      name: "field1",
      values: values,
      type: "SelectField",
    };
    const wrapper = shallow(
      <InlineConditionsDefinitionValue
        updateValue={updateValueCallback}
        fieldDef={fieldDef}
        operator="is"
      />
    );

    wrapper.find("#cond-value").simulate("change", { target: { value: "  " } });
    expect(updateValueCallback.calledOnce).to.equal(true);
    expect(updateValueCallback.firstCall.args[0]).to.equal(undefined);
  });

  const dateAndTimeMappings = [
    { type: "DateField", units: dateUnits },
    { type: "DatePartsField", units: dateUnits },
    { type: "TimeField", units: timeUnits, timeOnly: true },
    { type: "DateTimeField", units: dateTimeUnits },
    { type: "DateTimePartsField", units: dateTimeUnits },
  ];

  dateAndTimeMappings.forEach((mapping) => {
    relativeDateOrTimeOperatorNames.forEach((operator) => {
      test(`Should display custom component for ${mapping.type} component type and '${operator}' operator`, () => {
        const fieldDef = {
          label: "Something",
          name: "field1",
          type: mapping.type,
        };
        const expectedValue = new RelativeTimeValue(
          "18",
          "months",
          "in the future"
        );
        const wrapper = shallow(
          <InlineConditionsDefinitionValue
            updateValue={updateValueCallback}
            value={expectedValue}
            fieldDef={fieldDef}
            operator={operator}
          />
        );

        const timeShiftValues = wrapper.find("RelativeTimeValues");
        expect(timeShiftValues.exists()).to.equal(true);
        expect(timeShiftValues.prop("value")).to.equal(expectedValue);
        expect(timeShiftValues.prop("updateValue")).to.equal(
          updateValueCallback
        );
        expect(timeShiftValues.prop("units")).to.equal(mapping.units);
        expect(timeShiftValues.prop("timeOnly")).to.equal(
          mapping.timeOnly || false
        );
        expect(Object.keys(timeShiftValues.props()).length).to.equal(4);
      });
    });
  });
});
