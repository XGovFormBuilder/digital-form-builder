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
    it("validates NI number", () => {
      let testCases: [any, boolean][] = [
        ["AA123456C", true],
        ["AA 12 34 56 C", true],
        ["aa 12 34 56 c", true],
        ["aa123456c", true],
        ["", false],
        [1234567890, false],
        ["aa 12 34 56 c1", false],
        ["aa123456c1", false],
        ["aa123456", false],
        ["AA123456C1", false],
        ["AA123456", false],
      ];

      const component = new NationalInsuranceField(
        {
          ...componentDefinition,
          options: { required: true },
        },
        formModel
      );

      testCases.forEach((testCase: any) => {
        const [nino, shouldPass] = testCase;
        if (shouldPass) {
          expect(component.formSchema.validate(nino).error).to.not.exist();
        } else {
          expect(component.formSchema.validate(nino).error).to.exist();
        }
      });
    });
  });
});
