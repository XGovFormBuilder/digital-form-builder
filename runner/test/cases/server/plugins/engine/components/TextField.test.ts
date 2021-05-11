import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { TextField } from "../../../../../../src/server/plugins/engine/components";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";
import { FormSubmissionErrors } from "../../../../../../src/server/plugins/engine/types";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("TextField", () => {
  describe("Generated schema", () => {
    const componentDefinition: InputFieldsComponentsDef = {
      subType: "field",
      type: "TextField",
      name: "firstName",
      title: "What's your first name?",
      options: {
        autocomplete: "given-name",
      },
      schema: {},
    };

    // @ts-ignore
    const formModel: FormModel = {
      makePage: () => sinon.stub(),
    };

    const component = new TextField(componentDefinition, formModel);

    it("is required by default", () => {
      // @ts-ignore
      expect(component.formSchema?.describe().flags?.presence).to.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema?.validate({}).error).to.exist();
    });

    it("includes the first empty item in items list", () => {
      const viewModel = component.getViewModel(
        { lang: "en" },
        {} as FormSubmissionErrors
      );
      expect(viewModel.autocomplete).to.equal("given-name");
    });
  });
});
