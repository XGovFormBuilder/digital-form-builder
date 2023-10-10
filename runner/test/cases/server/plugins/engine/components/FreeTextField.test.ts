import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FreeTextField } from "server/plugins/engine/components/FreeTextField";
import { componentSchema } from "@xgovformbuilder/model";
import { messages } from "src/server/plugins/engine/pageControllers/validationOptions";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("FreeTextField", () => {
  describe("Generated schema", () => {
    let def, model;

    def = {
      type: "TextField",
      name: "example-field",
      title: "Example Field",
      schema: {},
      options: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new FreeTextField(def, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });
    it("is not required when explicitly configured", () => {
      const component = FreeTextComponent({ options: { required: false } });

      expect(component.formSchema.describe().flags.presence).to.not.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });

    function FreeTextComponent(properties) {
      return new FreeTextField(
        {
          ...def,
          ...properties,
        },
        formModel
      );
    }
  });
});
