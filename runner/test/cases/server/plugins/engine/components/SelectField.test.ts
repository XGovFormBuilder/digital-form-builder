import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormSubmissionErrors } from "../../../../../../src/server/plugins/engine/types";
import { SelectField } from "../../../../../../src/server/plugins/engine/components";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

const lists = [
  {
    name: "Countries",
    title: "Countries",
    type: "string",
    items: [
      {
        text: "United Kingdom",
        value: "United Kingdom",
        description: "",
        condition: "",
      },
      {
        text: "Thailand",
        value: "Thailand",
        description: "",
        condition: "",
      },
      {
        text: "Spain",
        value: "Spain",
        description: "",
        condition: "",
      },
      {
        text: "France",
        value: "France",
        description: "",
        condition: "",
      },
      {
        text: "Thailand",
        value: "Thailand",
        description: "",
        condition: "",
      },
    ],
  },
];

suite("SelectField", () => {
  describe("Generated schema", () => {
    const componentDefinition: ListComponentsDef = {
      subType: "field",
      type: "SelectField",
      name: "countryOfBirth",
      title: "Where were you born?",
      options: {},
      // @ts-ignore
      list: "Countries",
      schema: {},
    };

    // @ts-ignore
    const formModel: FormModel = {
      getList: (_name) => lists[0],
      makePage: () => sinon.stub(),
    };

    const component = new SelectField(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });

    it("includes the first empty item in items list", () => {
      const { items } = component.getViewModel(
        { lang: "en" },
        {} as FormSubmissionErrors
      );
      expect(items).to.exist();
      expect(items![0]).to.equal({ value: "" });
    });
  });
});
