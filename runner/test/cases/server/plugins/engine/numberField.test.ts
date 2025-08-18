import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { NumberField } from "src/server/plugins/engine/components/NumberField";
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
  type: "NumberField",
};

suite("Number field", () => {
  test("Error is displayed correctly when max configured", () => {
    const def = {
      ...baseDef,
      schema: { max: 30 },
    };
    const numberField = new NumberField(def);
    const { schema } = numberField;

    expect(schema.validate(40, { messages }).error.message).to.contain(
      "must be 30 or lower"
    );

    expect(schema.validate(30, { messages }).error).to.be.undefined();
  });

  test("Error is displayed correctly when min configured", () => {
    const def = {
      ...baseDef,
      schema: { min: 30 },
    };
    const numberField = new NumberField(def);
    const { schema } = numberField;

    expect(schema.validate(20, { messages }).error.message).to.contain(
      "must be 30 or higher"
    );

    expect(schema.validate(40, { messages }).error).to.be.undefined();
  });
});

test("Prefix and suffix are passed to view model", () => {
  const def = {
    ...baseDef,
    options: { prefix: "@£%", suffix: "&^%%" },
  };
  const numberFieldPrefixSuffix = new NumberField(def);
  const { schema } = numberFieldPrefixSuffix;

  expect(numberFieldPrefixSuffix.getViewModel({})).to.contain({
    prefix: { text: "@£%" },
    suffix: { text: "&^%%" },
  });

  test("Text type and numeric inputmode are used by default", () => {
    const numberFieldPrefixSuffix = new NumberField(baseDef);

    expect(numberFieldPrefixSuffix.getViewModel({})).to.contain({
      type: "text",
      inputmode: "numeric",
    });
  });

  test("Number type is used is precision is specified", () => {
    const def = {
      ...baseDef,
      schema: { precision: "0" },
    };
    const numberFieldPrefixSuffix = new NumberField(def);

    expect(numberFieldPrefixSuffix.getViewModel({})).to.contain({
      type: "number",
      attributes: {
        step: "0.1",
      },
    });
  });
});
