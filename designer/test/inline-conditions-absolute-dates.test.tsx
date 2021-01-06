import React from "react";
import { shallow } from "enzyme";
import * as Lab from "@hapi/lab";
import * as Code from "@hapi/code";
import {
  assertRequiredNumberInput,
  assertSelectInput,
} from "./helpers/element-assertions";
import sinon from "sinon";
import {
  absoluteDateOrTimeOperatorNames,
  ConditionValue,
} from "@xgovformbuilder/model";

import {
  AbsoluteDateTimeValues,
  AbsoluteTimeValues,
} from "../client/conditions/inline-conditions-absolute-dates";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test, describe } = lab;

suite("Inline conditions absolute date and time value inputs", () => {
  let updateValueCallback;

  beforeEach(() => {
    updateValueCallback = sinon.spy();
  });

  describe("absolute time operators", () => {
    absoluteDateOrTimeOperatorNames.forEach((operator) => {
      test(`should display the expected inputs for '${operator}' operator`, () => {
        const existingValue = new ConditionValue("13:46");
        const wrapper = shallow(
          <AbsoluteTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        assertRequiredNumberInput(
          wrapper.find("#cond-value-hours"),
          "cond-value-hours",
          "13"
        );
        assertRequiredNumberInput(
          wrapper.find("#cond-value-minutes"),
          "cond-value-minutes",
          "46"
        );
      });

      test(`specifying all inputs in order should save the expected value for adding with '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteTimeValues updateValue={updateValueCallback} />
        );

        wrapper
          .find("#cond-value-hours")
          .simulate("change", { target: { value: "01" } });
        wrapper
          .find("#cond-value-minutes")
          .simulate("change", { target: { value: "11" } });

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("01:11")
        );
      });

      test(`hours and minutes should be padded with zeros for '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteTimeValues updateValue={updateValueCallback} />
        );

        wrapper
          .find("#cond-value-hours")
          .simulate("change", { target: { value: "1" } });
        wrapper
          .find("#cond-value-minutes")
          .simulate("change", { target: { value: "2" } });

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("01:02")
        );
      });

      test(`specifying all inputs out of order should save the expected value for adding with '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteTimeValues updateValue={updateValueCallback} />
        );

        wrapper
          .find("#cond-value-minutes")
          .simulate("change", { target: { value: "11" } });
        wrapper
          .find("#cond-value-hours")
          .simulate("change", { target: { value: "1" } });

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("01:11")
        );
      });

      test(`specifying minutes only should not trigger a save '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteTimeValues updateValue={updateValueCallback} />
        );

        wrapper
          .find("#cond-value-minutes")
          .simulate("change", { target: { value: "11" } });

        expect(updateValueCallback.callCount).to.equal(0);
      });

      test(`specifying hours only should not trigger a save '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteTimeValues updateValue={updateValueCallback} />
        );

        wrapper
          .find("#cond-value-hours")
          .simulate("change", { target: { value: "11" } });

        expect(updateValueCallback.callCount).to.equal(0);
      });

      test(`updating hours should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new ConditionValue("13:46");
        const wrapper = shallow(
          <AbsoluteTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        wrapper
          .find("#cond-value-hours")
          .simulate("change", { target: { value: "12" } });

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("12:46")
        );
      });

      test(`updating minutes should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new ConditionValue("13:46");
        const wrapper = shallow(
          <AbsoluteTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        wrapper
          .find("#cond-value-minutes")
          .simulate("change", { target: { value: "12" } });

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("13:12")
        );
      });
    });
  });

  describe("absolute date time operators", () => {
    absoluteDateOrTimeOperatorNames.forEach((operator) => {
      test(`should display the expected inputs for '${operator}' operator`, () => {
        const existingValue = new ConditionValue("2020-01-03T13:46:23.463Z");
        const wrapper = shallow(
          <AbsoluteDateTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        const absoluteDateValues = wrapper.find("AbsoluteDateValues");
        expect(absoluteDateValues.exists()).to.equal(true);
        expect(absoluteDateValues.prop("value")).to.equal(
          new ConditionValue("2020-01-03")
        );

        const absoluteTimeValues = wrapper.find("AbsoluteTimeValues");
        expect(absoluteTimeValues.exists()).to.equal(true);
        expect(absoluteTimeValues.prop("value")).to.equal(
          new ConditionValue("13:46")
        );

        assertSelectInput({
          wrapper: wrapper.find("#cond-value-tz"),
          id: "cond-value-tz",
          expectedFieldOptions: momentTz.tz
            .names()
            .map((tz) => ({ value: tz, text: tz })),
          expectedValue: "Europe/London",
        });
      });

      test(`should convert date and time back to default time zone when displaying '${operator}' operator`, () => {
        const existingValue = new ConditionValue(
          "2020-01-03T21:46:23.463-05:00"
        );
        const wrapper = shallow(
          <AbsoluteDateTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        const absoluteDateValues = wrapper.find("AbsoluteDateValues");
        expect(absoluteDateValues.exists()).to.equal(true);
        expect(absoluteDateValues.prop("value")).to.equal(
          new ConditionValue("2020-01-04")
        );

        const absoluteTimeValues = wrapper.find("AbsoluteTimeValues");
        expect(absoluteTimeValues.exists()).to.equal(true);
        expect(absoluteTimeValues.prop("value")).to.equal(
          new ConditionValue("02:46")
        );

        assertSelectInput({
          wrapper: wrapper.find("#cond-value-tz"),
          id: "cond-value-tz",
          expectedFieldOptions: momentTz.tz
            .names()
            .map((tz) => ({ value: tz, text: tz })),
          expectedValue: "Europe/London",
        });
      });

      test(`specifying date and time inputs in order should save the expected value for adding with '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteDateTimeValues updateValue={updateValueCallback} />
        );

        wrapper.find("AbsoluteDateValues").prop("updateValue")(
          new ConditionValue("2020-03-13")
        );
        wrapper.find("AbsoluteTimeValues").prop("updateValue")(
          new ConditionValue("02:17")
        );

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("2020-03-13T02:17:00.000Z")
        );
      });

      test(`Value should apply daylight savings in the default time zone for adding with '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteDateTimeValues updateValue={updateValueCallback} />
        );

        wrapper.find("AbsoluteDateValues").prop("updateValue")(
          new ConditionValue("2020-07-13")
        );
        wrapper.find("AbsoluteTimeValues").prop("updateValue")(
          new ConditionValue("02:17")
        );

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("2020-07-13T01:17:00.000Z")
        );
      });

      test(`Value should have the specified time zone when specified for adding with '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteDateTimeValues updateValue={updateValueCallback} />
        );

        wrapper
          .find("#cond-value-tz")
          .simulate("change", { target: { value: "America/New_York" } });
        wrapper.find("AbsoluteDateValues").prop("updateValue")(
          new ConditionValue("2020-07-13")
        );
        wrapper.find("AbsoluteTimeValues").prop("updateValue")(
          new ConditionValue("02:17")
        );

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("2020-07-13T06:17:00.000Z")
        );
      });

      test(`specifying all inputs out of order should save the expected value for adding with '${operator}' operator`, () => {
        const wrapper = shallow(
          <AbsoluteDateTimeValues updateValue={updateValueCallback} />
        );

        wrapper.find("AbsoluteTimeValues").prop("updateValue")(
          new ConditionValue("02:17")
        );
        wrapper.find("AbsoluteDateValues").prop("updateValue")(
          new ConditionValue("2020-03-13")
        );

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("2020-03-13T02:17:00.000Z")
        );
      });

      test(`updating time should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new ConditionValue("2020-01-03T13:46:23.463");
        const wrapper = shallow(
          <AbsoluteDateTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        wrapper.find("AbsoluteTimeValues").prop("updateValue")(
          new ConditionValue("02:17")
        );

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("2020-01-03T02:17:00.000Z")
        );
      });

      test(`updating date should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new ConditionValue("2020-01-03T13:46:23.463");
        const wrapper = shallow(
          <AbsoluteDateTimeValues
            value={existingValue}
            updateValue={updateValueCallback}
          />
        );

        wrapper.find("AbsoluteDateValues").prop("updateValue")(
          new ConditionValue("2019-02-06")
        );

        expect(updateValueCallback.callCount).to.equal(1);
        expect(updateValueCallback.firstCall.args.length).to.equal(1);
        expect(updateValueCallback.firstCall.args[0]).to.equal(
          new ConditionValue("2019-02-06T13:46:00.000Z")
        );
      });
    });
  });
});
