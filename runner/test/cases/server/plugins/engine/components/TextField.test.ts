 import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { TextField } from "server/plugins/engine/components/TextField";

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
      schema: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new TextField(componentDefinition, formModel);
 
    it("is required by default", () => {
      expect(component.schema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("is not required when explicitly configured", () => {
      const component = new TextField(
        {
          ...componentDefinition,
          options: { required: false },
        },
        formModel
      );
      expect(component.schema.describe().flags.presence).to.not.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.schema.validate({}).error).to.exist();
    });
  });
});
