import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { NationalInsuranceField } from "server/plugins/engine/components/NationalInsuranceField";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it } = lab;
import sinon from "sinon";

suite("NationalInsuranceField", () => {
  describe("Generated schema", () => {
    const componentDefinition: NationalInsuranceField = {
      name: "NRBhkR",
      options: {},
      type: "NationalInsuranceField",
      title: "title",
      hint: "hint",
      schema: {},
      subtype: "",
      list: null,
      subType: "field",
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new NationalInsuranceField(
      componentDefinition,
      formModel
    );
    it("is required by default", () => {
      console.log(component.formSchema.describe());
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });
    it("is not required when explicitly configured", () => {
      const component = new NationalInsuranceField(
        {
          ...componentDefinition,
          options: { required: false },
        },
        formModel
      );
      expect(component.formSchema.validate("").error).to.not.exist();
    });
    it("validates and fails", () => {
      const component = new NationalInsuranceField(
        {
          ...componentDefinition,
          options: { required: true },
        },
        formModel
      );
      expect(component.formSchema.validate("").error).to.exist();
      expect(component.formSchema.validate(1234567890).error).to.exist();
      expect(component.formSchema.validate("aa 12 34 56 c1").error).to.exist();
      expect(component.formSchema.validate("aa123456c1").error).to.exist();
      expect(component.formSchema.validate("aa123456").error).to.exist();
      expect(component.formSchema.validate("QQ123456C").error).to.exist();
    });
    it("validates and passes", () => {
      const component = new NationalInsuranceField(
        {
          ...componentDefinition,
          options: { required: true },
        },
        formModel
      );

      expect(component.formSchema.validate("AA123456C").error).to.not.exist();
      expect(
        component.formSchema.validate("AA 12 34 56 C").error
      ).to.not.exist();
      expect(
        component.formSchema.validate("aa 12 34 56 c").error
      ).to.not.exist();
      expect(component.formSchema.validate("aa123456c").error).to.not.exist();
    });
  });
});
