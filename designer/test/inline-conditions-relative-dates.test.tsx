import React from "react";
import { shallow } from "enzyme";
import * as Lab from "@hapi/lab";
import * as Code from "@hapi/code";
import {
  assertRequiredTextInput,
  assertSelectInput,
} from "./helpers/element-assertions";
import sinon from "sinon";
import {
  dateDirections,
  dateTimeUnits,
  dateUnits,
  RelativeTimeValue,
  timeUnits,
} from "@xgovformbuilder/model";
import RelativeTimeValues from "../client/conditions/inline-conditions-relative-dates";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test } = lab;

function aRandomItemFrom(units) {
  const values = Object.values(units);
  return values[Math.floor(Math.random() * values.length)];
}

suite("Inline conditions relative time value inputs", () => {
  const dateAndTimeMappings = [
    { type: "DateField", units: dateUnits },
    { type: "DatePartsField", units: dateUnits },
    { type: "TimeField", units: timeUnits, timeOnly: true },
    { type: "DateTimeField", units: dateTimeUnits },
    { type: "DateTimePartsField", units: dateTimeUnits },
  ];

  let updateValueCallback;

  beforeEach(() => {
    updateValueCallback = sinon.spy();
  });

  dateAndTimeMappings.forEach((mapping) => {
    test(`should display the expected inputs for ${mapping.type} component type`, () => {
      const unit = aRandomItemFrom(mapping.units).value;
      const existingValue = new RelativeTimeValue(
        "18",
        unit,
        dateDirections.FUTURE
      );
      const wrapper = shallow(
        <RelativeTimeValues
          value={existingValue}
          updateValue={updateValueCallback}
          units={mapping.units}
          timeOnly={mapping.timeOnly}
        />
      );

      assertRequiredTextInput({
        wrapper: wrapper.find("#cond-value-period"),
        id: "cond-value-period",
        expectedValue: "18",
      });
      assertSelectInput({
        wrapper: wrapper.find("#cond-value-units"),
        id: "cond-value-units",
        expectedFieldOptions: valuesAndDisplayOptionsWithEmptyOption(
          Object.values(mapping.units)
        ),
        expectedValue: unit,
      });
      assertSelectInput({
        wrapper: wrapper.find("#cond-value-direction"),
        id: "cond-value-direction",
        expectedFieldOptions: singleValueAndDisplayOptionsWithEmptyOption(
          Object.values(dateDirections)
        ),
        expectedValue: dateDirections.FUTURE,
      });
    });

    test(`specifying all inputs in order should save the expected value for adding ${mapping.type} component type`, () => {
      const unit = aRandomItemFrom(mapping.units).value;
      const wrapper = shallow(
        <RelativeTimeValues
          updateValue={updateValueCallback}
          units={mapping.units}
          timeOnly={mapping.timeOnly}
        />
      );

      wrapper
        .find("#cond-value-period")
        .simulate("change", { target: { value: "18" } });
      wrapper
        .find("#cond-value-units")
        .simulate("change", { target: { value: unit } });
      wrapper
        .find("#cond-value-direction")
        .simulate("change", { target: { value: dateDirections.FUTURE } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new RelativeTimeValue(
          "18",
          unit,
          dateDirections.FUTURE,
          mapping.timeOnly || false
        )
      );
    });

    test(`specifying all inputs out of order should save the expected value for adding ${mapping.type} component type`, () => {
      const unit = aRandomItemFrom(mapping.units).value;
      const wrapper = shallow(
        <RelativeTimeValues
          updateValue={updateValueCallback}
          units={mapping.units}
          timeOnly={mapping.timeOnly}
        />
      );

      wrapper
        .find("#cond-value-direction")
        .simulate("change", { target: { value: dateDirections.FUTURE } });
      wrapper
        .find("#cond-value-units")
        .simulate("change", { target: { value: unit } });
      wrapper
        .find("#cond-value-period")
        .simulate("change", { target: { value: "18" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new RelativeTimeValue(
          "18",
          unit,
          dateDirections.FUTURE,
          mapping.timeOnly || false
        )
      );
    });

    test(`updating period should save the expected value for editing ${mapping.type} component type`, () => {
      const unit = aRandomItemFrom(mapping.units).value;
      const existingValue = new RelativeTimeValue(
        "18",
        unit,
        dateDirections.FUTURE,
        mapping.timeOnly || false
      );
      const wrapper = shallow(
        <RelativeTimeValues
          value={existingValue}
          updateValue={updateValueCallback}
          units={mapping.units}
          timeOnly={mapping.timeOnly}
        />
      );

      wrapper
        .find("#cond-value-period")
        .simulate("change", { target: { value: "12" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new RelativeTimeValue(
          "12",
          unit,
          dateDirections.FUTURE,
          mapping.timeOnly || false
        )
      );
    });

    test(`updating units should save the expected value for editing ${mapping.type} component type`, () => {
      const existingValue = new RelativeTimeValue(
        "18",
        Object.values(mapping.units)[1].value,
        dateDirections.FUTURE,
        mapping.timeOnly || false
      );
      const wrapper = shallow(
        <RelativeTimeValues
          value={existingValue}
          updateValue={updateValueCallback}
          units={mapping.units}
          timeOnly={mapping.timeOnly}
        />
      );

      const unit = aRandomItemFrom(mapping.units).value;
      wrapper
        .find("#cond-value-units")
        .simulate("change", { target: { value: unit } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new RelativeTimeValue(
          "18",
          unit,
          dateDirections.FUTURE,
          mapping.timeOnly || false
        )
      );
    });

    test(`updating period should save the expected value for editing ${mapping.type} component type`, () => {
      const unit = aRandomItemFrom(mapping.units).value;
      const existingValue = new RelativeTimeValue(
        "18",
        unit,
        dateDirections.FUTURE
      );
      const wrapper = shallow(
        <RelativeTimeValues
          value={existingValue}
          updateValue={updateValueCallback}
          units={mapping.units}
          timeOnly={mapping.timeOnly}
        />
      );

      wrapper
        .find("#cond-value-direction")
        .simulate("change", { target: { value: dateDirections.PAST } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new RelativeTimeValue(
          "18",
          unit,
          dateDirections.PAST,
          mapping.timeOnly || false
        )
      );
    });
  });
});

function singleValueAndDisplayOptionsWithEmptyOption(values) {
  const toReturn = values.map((it) => ({ value: it, text: it }));
  toReturn.unshift({ text: "" });
  return toReturn;
}

function valuesAndDisplayOptionsWithEmptyOption(values) {
  const toReturn = values.map((it) => ({ value: it.value, text: it.display }));
  toReturn.unshift({ text: "" });
  return toReturn;
}
