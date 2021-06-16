import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { TelephoneNumberField } from "src/server/plugins/engine/components";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Telephone number field", () => {
  test("Should supply custom validation message if defined", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {
        customValidation: "This is a custom error",
        required: false,
      },
      schema: {
        max: 11,
      },
    };
    const telephoneNumberField = new TelephoneNumberField(def, {});
    const { schema } = telephoneNumberField;

    expect(schema.validate("not a phone").error.message).to.equal(
      "This is a custom error"
    );
    expect(schema.validate("123456789_10_11_12").error.message).to.equal(
      "This is a custom error"
    );
    expect(schema.validate("").error).to.be.undefined();
    expect(schema.validate("+111-111-11").error).to.be.undefined();
    expect(schema.validate("+11111111").error).to.be.undefined();
  });

  test("Should apply default schema if no options are passed", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {},
    };
    const telephoneNumberField = new TelephoneNumberField(def, {});
    const { schema } = telephoneNumberField;

    expect(schema.validate("not a phone").error.message).to.equal(
      "Enter a telephone number in the correct format"
    );
    expect(schema.validate("").error.message).to.equal(
      '"My component" is not allowed to be empty'
    );
  });
});
