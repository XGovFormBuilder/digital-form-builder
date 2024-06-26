import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { MultilineTextField } from "src/server/plugins/engine/components";
import { validationOptions } from "../../../../../src/server/plugins/engine/pageControllers/validationOptions";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Multiline text field", () => {
  test("Should supply custom validation message if defined", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {
        required: false,
        customValidationMessage: "This is a custom error",
      },
      schema: {
        max: 2,
      },
    };
    const multilineTextField = new MultilineTextField(def, {});
    const { formSchema } = multilineTextField;
    expect(formSchema.validate("a").error).to.be.undefined();

    expect(formSchema.validate("too many").error.message).to.equal(
      "This is a custom error"
    );
  });

  test("Should validate when schema options are supplied", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {
        min: 4,
        max: 5,
      },
    };
    const multilineTextField = new MultilineTextField(def, {});
    const { formSchema } = multilineTextField;

    expect(
      formSchema.validate("yolk", validationOptions).error
    ).to.be.undefined();

    expect(
      formSchema.validate("egg", validationOptions).error.message
    ).to.equal("my component must be 4 characters or more");
    expect(
      formSchema.validate("scrambled", validationOptions).error.message
    ).to.equal("my component must be 5 characters or less");

    expect(
      formSchema.validate("scrambled", validationOptions).error.message
    ).to.equal("my component must be 5 characters or less");
  });

  test("Should apply default schema if no options are passed", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {},
    };
    const multilineTextField = new MultilineTextField(def, {});
    const { formSchema } = multilineTextField;

    expect(formSchema.validate("", validationOptions).error.message).to.equal(
      "Enter my component"
    );
    expect(formSchema.validate("benedict").error).to.be.undefined();
  });

  test("should return correct view model when maxwords or schema.length configured", () => {
    const multilineTextFieldMaxWordsDef = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {
        maxWords: 100,
      },
      schema: {
        min: 2,
      },
    };
    const multilineTextFieldMaxWords = new MultilineTextField(
      multilineTextFieldMaxWordsDef,
      {}
    );
    expect(multilineTextFieldMaxWords.getViewModel({})).to.contain({
      isCharacterOrWordCount: true,
      maxwords: 100,
    });

    const multilineTextFieldMaxCharsDef = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {
        max: 5,
        min: 2,
      },
    };
    const multilineTextFieldMaxChars = new MultilineTextField(
      multilineTextFieldMaxCharsDef,
      {}
    );
    expect(multilineTextFieldMaxChars.getViewModel({})).to.contain({
      isCharacterOrWordCount: true,
      maxlength: 5,
    });
  });

  test("should return correct view model when not configured with maxwords or schema.length", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {},
    };
    const multilineTextFieldMaxWords = new MultilineTextField(def, {});
    expect(multilineTextFieldMaxWords.getViewModel({})).to.contain({
      isCharacterOrWordCount: false,
    });
  });
});
