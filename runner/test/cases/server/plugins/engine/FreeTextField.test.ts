import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FreeTextField } from "src/server/plugins/engine/components";
import { validationOptions } from "../../../../../src/server/plugins/engine/pageControllers/validationOptions";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Free text field", () => {
  test("Should return correct view model when not configured with max words", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {},
    };
    const freeTextField = new FreeTextField(def, {});
    expect(freeTextField.getViewModel({})).to.contain({
      isCharacterOrWordCount: false,
    });
  });
  test("Should return correct view model when configured with max words", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {
        maxWords: 26,
      },
      schema: {},
    };
    const freeTextField = new FreeTextField(def, {});
    expect(freeTextField.getViewModel({})).to.contain({
      isCharacterOrWordCount: true,
      maxWords: 26,
    });
  });

  test("Should supply custom validation message if defined", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {
        required: false,
        customValidationMessage: "This is a custom error",
        maxWords: 2,
      },
      schema: {},
    };
    const freeTextField = new FreeTextField(def, {});
    const { formSchema } = freeTextField;

    expect(formSchema.validate("a").error).to.be.undefined();

    expect(
      formSchema.validate("too many words in here").error.message
    ).to.equal("This is a custom error");
  });
});
