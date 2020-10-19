import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { ConditionValue, valueFrom } from "../src";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;

const { suite, test } = lab;

suite("inline condition values", () => {
  test("can deserialize a Value object from plain old JSON", () => {
    const value = {
      type: "Value",
      value: "badgers",
      display: "Badgers",
    };
    const returned = valueFrom(value);

    expect(returned instanceof ConditionValue).to.equal(true);
    expect(returned).to.equal(new ConditionValue("badgers", "Badgers"));
  });

  test("can deserialize a RelativeTimeValue object from plain old JSON", () => {
    const value = {
      type: "Value",
      value: "badgers",
      display: "Badgers",
    };
    const returned = valueFrom(value);

    expect(returned instanceof ConditionValue).to.equal(true);
    expect(returned).to.equal(new ConditionValue("badgers", "Badgers"));
  });
});
