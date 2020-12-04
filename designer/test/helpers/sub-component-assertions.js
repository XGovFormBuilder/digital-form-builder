import { Input } from "@govuk-jsx/input";
import * as Code from "@hapi/code";

const { expect } = Code;

export function assertInputControlValue({ wrapper, id, expectedValue }) {
  return assertInputControlProp({ wrapper, id, prop: "value", expectedValue });
}

export function assertInputControlProp({ wrapper, id, prop, expectedValue }) {
  expect(
    wrapper
      .find(Input)
      .filter("#" + id)
      .prop(prop)
  ).to.equal(expectedValue);
}
