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
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });
  });

  describe("Optional field generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "TextField",
      name: "middleName",
      title: "What's your middle name?",
      options: {
        autocomplete: "middle-name",
        required: false,
      },
      schema: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new TextField(componentDefinition, formModel);

    it("is not required", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(null);
    });
  });
});
