import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { CheckboxesField } from "server/plugins/engine/components/CheckboxesField";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it } = lab;
import sinon from "sinon";

const lists = [
  {
    name: "numberOfApplicants",
    title: "Number of people",
    type: "number",
    items: [
      {
        text: "1",
        value: 1,
        description: "",
        condition: "",
      },
      {
        text: "2",
        value: 2,
        description: "",
        condition: "",
      },
      {
        text: "3",
        value: 3,
        description: "",
        condition: "",
      },
      {
        text: "4",
        value: 4,
        description: "",
        condition: "",
      },
    ],
  },
];

suite("CheckboxesField", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "CheckboxesField",
      name: "myCheckbox",
      title: "Tada",
      options: {},
      list: "numberOfApplicants",
      schema: {},
    };
    const formModel = {
      getList: (_name) => lists[0],
      makePage: () => sinon.stub(),
    };
    const component = new CheckboxesField(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });
    it("allows the items defined in the List object with the correct type", () => {
      expect(component.formSchema.describe().items).to.contain({
        type: "number",
        allow: [1, 2, 3, 4],
      });
    });
    it("allows single answers", () => {
      expect(component.formSchema.describe().flags).to.contain({
        single: true,
      });
    });
    it("is not required when explicitly configured", () => {
      const component = new CheckboxesField(
        {
          ...componentDefinition,
          options: { required: false },
        },
        formModel
      );
      expect(component.formSchema.describe().flags.presence).to.not.equal(
        "required"
      );
    });
    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });
  });
});
