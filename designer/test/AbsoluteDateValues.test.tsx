import React from "react";
import { AbsoluteDateValues } from "../client/conditions/AbsoluteDateValues";
import { shallow } from "enzyme";
import * as Lab from "@hapi/lab";
import * as Code from "@hapi/code";
import sinon from "sinon";
import { ConditionValue } from "@xgovformbuilder/model";
import { assertRequiredNumberInput } from "./helpers/element-assertions";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test, describe } = lab;

let updateValueCallback;

suite("Inline conditions absolute date value inputs", () => {
  beforeEach(() => {
    updateValueCallback = sinon.spy();
  });

  describe("absolute date operators", () => {
    test(`should display the expected inputs`, () => {
      const dateParts = { year: 2020, month: 1, day: 2 };
      const wrapper = shallow(
        <AbsoluteDateValues {...dateParts} updateValue={updateValueCallback} />
      );

      console.log(wrapper.html());
      assertRequiredNumberInput(
        wrapper.find("#cond-value-year"),
        "cond-value-year",
        "2020"
      );
      assertRequiredNumberInput(
        wrapper.find("#cond-value-month"),
        "cond-value-month",
        "01"
      );
      assertRequiredNumberInput(
        wrapper.find("#cond-value-day"),
        "cond-value-day",
        "02"
      );
    });

    test(`specifying all inputs in order should save the expected value`, () => {
      const wrapper = shallow(
        <AbsoluteDateValues updateValue={updateValueCallback} />
      );

      wrapper
        .find("#cond-value-day")
        .simulate("change", { target: { value: "01" } });
      wrapper
        .find("#cond-value-month")
        .simulate("change", { target: { value: "11" } });
      wrapper
        .find("#cond-value-year")
        .simulate("change", { target: { value: "2018" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new ConditionValue("2018-11-01")
      );
    });

    test(`specifying some inputs should not trigger a save callback`, () => {
      const wrapper = shallow(
        <AbsoluteDateValues updateValue={updateValueCallback} />
      );

      wrapper
        .find("#cond-value-month")
        .simulate("change", { target: { value: "11" } });
      wrapper
        .find("#cond-value-year")
        .simulate("change", { target: { value: "2018" } });

      expect(updateValueCallback.callCount).to.equal(0);
    });

    test(`Days and months should be left padded with zeros `, () => {
      const wrapper = shallow(
        <AbsoluteDateValues updateValue={updateValueCallback} />
      );

      wrapper
        .find("#cond-value-day")
        .simulate("change", { target: { value: "1" } });
      wrapper
        .find("#cond-value-month")
        .simulate("change", { target: { value: "2" } });
      wrapper
        .find("#cond-value-year")
        .simulate("change", { target: { value: "2018" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new ConditionValue("2018-02-01")
      );
    });

    test(`specifying all inputs out of order should save the expected value`, () => {
      const wrapper = shallow(
        <AbsoluteDateValues updateValue={updateValueCallback} />
      );

      wrapper
        .find("#cond-value-month")
        .simulate("change", { target: { value: "11" } });
      wrapper
        .find("#cond-value-year")
        .simulate("change", { target: { value: "2018" } });
      wrapper
        .find("#cond-value-day")
        .simulate("change", { target: { value: "01" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new ConditionValue("2018-11-01")
      );
    });

    test(`updating day should save the expected value for editing`, () => {
      const existingValue = new ConditionValue("2020-01-02");
      const wrapper = shallow(
        <AbsoluteDateValues
          value={existingValue}
          updateValue={updateValueCallback}
        />
      );

      wrapper
        .find("#cond-value-day")
        .simulate("change", { target: { value: "12" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new ConditionValue("2020-01-12")
      );
    });

    test(`updating month should save the expected value for editing`, () => {
      const existingValue = new ConditionValue("2020-01-02");
      const wrapper = shallow(
        <AbsoluteDateValues
          value={existingValue}
          updateValue={updateValueCallback}
        />
      );

      wrapper
        .find("#cond-value-month")
        .simulate("change", { target: { value: "12" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new ConditionValue("2020-12-02")
      );
    });

    test(`updating year should save the expected value for editing`, () => {
      const existingValue = new ConditionValue("2020-01-02");
      const wrapper = shallow(
        <AbsoluteDateValues
          value={existingValue}
          updateValue={updateValueCallback}
        />
      );

      wrapper
        .find("#cond-value-year")
        .simulate("change", { target: { value: "2012" } });

      expect(updateValueCallback.callCount).to.equal(1);
      expect(updateValueCallback.firstCall.args.length).to.equal(1);
      expect(updateValueCallback.firstCall.args[0]).to.equal(
        new ConditionValue("2012-01-02")
      );
    });
  });
});
