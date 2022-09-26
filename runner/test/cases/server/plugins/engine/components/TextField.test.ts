import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { TextField } from "server/plugins/engine/components/TextField";
import { componentSchema } from "@xgovformbuilder/model";
import { messages } from "src/server/plugins/engine/pageControllers/validationOptions";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("TextField", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "TextField",
      name: "firstName",
      title: "What's your first name?",
      options: {
        autocomplete: "given-name",
      },
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new TextField(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("is not required when explicitly configured", () => {
      const component = TextComponent({ options: { required: false } });

      expect(component.formSchema.describe().flags.presence).to.not.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });

    it("should match pattern for regex", () => {
      let component = TextComponent({ schema: { regex: "[abc]*" } });

      expect(component.formSchema.validate("ab", { messages })).to.be.equal({
        value: "ab",
      });

      component = TextComponent({ schema: { regex: null } });

      expect(component.formSchema.validate("*", { messages })).to.be.equal({
        value: "*",
      });

      component = TextComponent({ schema: { regex: undefined } });

      expect(component.formSchema.validate("/", { messages })).to.be.equal({
        value: "/",
      });

      component = TextComponent({ schema: { regex: "" } });

      expect(component.formSchema.validate("", { messages })).to.not.be.equal({
        value: "",
      });

      component = TextComponent({
        schema: {
          regex: "[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}",
          min: 5,
          max: 10,
        },
      });

      expect(
        component.formSchema.validate("AJ98 7AX", { messages })
      ).to.be.equal({ value: "AJ98 7AX" });

      const invalidRegexResult = component.formSchema.validate("###six");
      expect(invalidRegexResult.error.details[0].type).to.be.equal(
        "string.pattern.base"
      );

      const tooFewCharsResult = component.formSchema.validate("AJ98");
      expect(tooFewCharsResult.error.details[0].type).to.be.equal("string.min");

      const tooManyCharsResult = component.formSchema.validate(
        "AJ98 7AXAJ98 7AX"
      );
      expect(tooManyCharsResult.error.details[0].type).to.be.equal(
        "string.max"
      );
    });

    function TextComponent(properties) {
      return new TextField(
        {
          ...componentDefinition,
          ...properties,
        },
        formModel
      );
    }
  });
});
