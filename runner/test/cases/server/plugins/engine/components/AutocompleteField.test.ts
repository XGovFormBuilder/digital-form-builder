import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { AutocompleteField } from "server/plugins/engine/components/AutocompleteField";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it } = lab;
import sinon from "sinon";

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

suite("AutocompleteField", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "AutocompleteField",
      name: "MyAutocomplete",
      title: "Country?",
      options: {},
      list: "Countries",
      schema: {},
    };

    const formModel = {
      getList: (_name) => lists[0],
      makePage: () => sinon.stub(),
    };

    const component = new AutocompleteField(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });

    it("includes the first empty item in items list", () => {
      const { items } = component.getViewModel({ lang: "en" });
      expect(items[0]).to.equal({ value: "" });
    });
  });
});
