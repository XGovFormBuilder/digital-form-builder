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
        customValidationMessage: "This is a custom error",
        required: false,
      },
    };
    const telephoneNumberField = new TelephoneNumberField(def, {});
    const { schema } = telephoneNumberField;

    expect(schema.validate("not a phone").error.message).to.equal(
      "This is a custom error"
    );
    expect(schema.validate("").error).to.be.undefined();
    expect(schema.validate("+111-111-11").error).to.be.undefined();
    expect(schema.validate("+111 111 11").error).to.be.undefined();
    expect(schema.validate("+11111111").error).to.be.undefined();
  });

  test("Should validate when schema options are supplied", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {
        min: 3,
        max: 5,
        regex: "^[0-9+()]*$",
      },
    };
    const telephoneNumberField = new TelephoneNumberField(def, {});
    const { schema } = telephoneNumberField;

    expect(schema.validate("1234").error).to.be.undefined();
    expect(schema.validate("12345").error).to.be.undefined();
    expect(schema.validate("1").error.message).to.contain(
      "must be at least 3 characters long"
    );
    expect(schema.validate("12-3").error.message).to.contain(
      "Enter a telephone number in the correct format"
    );
    expect(schema.validate("1  1").error.message).to.contain(
      "Enter a telephone number in the correct format"
    );
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
  });
  test("Should add 'tel' to the autocomplete attribute", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {},
    };
    const telephoneNumberField = new TelephoneNumberField(def, {});
    expect(telephoneNumberField.getViewModel({})).to.contain({
      autocomplete: "tel",
    });
  });
});
