import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { DateField } from "src/server/plugins/engine/components/DateField";
import { messages } from "src/server/plugins/engine/pageControllers/validationOptions";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

const baseDef = {
  name: "myComponent",
  title: "My component",
  options: { required: true },
  schema: {},
  type: "DateField",
};

suite("Date field", () => {
  test("Error is displayed for invalid date", () => {
    const dateField = new DateField(baseDef);
    const { schema } = dateField;

    expect(schema.validate("", { messages }).error.message).to.contain(
      "must be a real date"
    );
    expect(
      schema.validate("not-a-date", { messages }).error.message
    ).to.contain("must be a real date");

    expect(
      schema.validate("30-30-3000", { messages }).error.message
    ).to.contain("must be a real date");

    expect(
      schema.validate("4000-40-40", { messages }).error.message
    ).to.contain("must be a real date");

    expect(schema.validate("2021-12-25", { messages }).error).to.be.undefined();
  });

  test("Error is displayed correctly when maxDaysInFuture configured", () => {
    const def = {
      ...baseDef,
      options: { maxDaysInFuture: 5 },
    };
    const dateField = new DateField(def);
    const { schema } = dateField;
    let date = new Date();
    date = new Date(date.setMonth(date.getMonth() + 5));

    expect(
      schema.validate(date.toISOString(), { messages }).error.message
    ).to.contain("must be the same as or before");

    expect(
      schema.validate(new Date().toISOString(), { messages }).error
    ).to.be.undefined();
  });

  test("Error is displayed correctly when maxDaysInPast configured", () => {
    const def = {
      ...baseDef,
      options: { maxDaysInPast: 5 },
    };
    const dateField = new DateField(def);
    const { schema } = dateField;
    let date = new Date();
    date = new Date(date.setMonth(date.getMonth() - 5));

    expect(
      schema.validate(date.toISOString(), { messages }).error.message
    ).to.contain("must be the same as or after");

    expect(
      schema.validate(new Date().toISOString(), { messages }).error
    ).to.be.undefined();
  });
});
