import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { ListFormComponent } from "src/server/plugins/engine/components/ListFormComponent";

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

suite("ListFormComponent", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "SelectField",
      name: "mySelectField",
      title: "Tada",
      options: {},
      list: "numberOfApplicants",
      schema: {},
    };
    const formModel = {
      getList: (_name) => lists[0],
      makePage: () => sinon.stub(),
    };
    const component = new ListFormComponent(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("allows the items defined in the List object with the correct type", () => {
      expect(component.formSchema.describe()).to.contain({
        type: "number",
        allow: [1, 2, 3, 4],
      });
    });

    it("is not required when explicitly configured", () => {
      const component = new ListFormComponent(
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
      const badPayload = { notMyName: 5 };
      expect(component.formSchema.validate(badPayload).error).to.exist();
    });

    it("is labelled correctly", () => {
      expect(component.formSchema.describe().flags.label).to.equal("tada");
    });
  });
});
