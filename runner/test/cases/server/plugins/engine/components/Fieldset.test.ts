import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Fieldset } from "server/plugins/engine/components/Fieldset";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it } = lab;

suite("Fieldset", () => {
  const formModel: any = {};

  const componentDefinition: any = {
    type: "Fieldset",
    name: "address",
    title: "Address",
    options: {},
    schema: {},
    components: [
      {
        type: "TextField",
        name: "line1",
        title: "Line 1",
        options: {},
        schema: {},
      },
      {
        type: "TextField",
        name: "line2",
        title: "Line 2",
        options: { required: false },
        schema: {},
      },
    ],
  };

  const componentDefinitionWithValidation: any = {
    ...componentDefinition,
    options: {
      validation: [
        {
          fields: ["line1", "line2"],
          minRequired: 1,
          errorMessage: "Enter at least one line",
        },
      ],
    },
  };

  describe("getStateSchemaKeys", () => {
    it("merges the fieldset's own key with its children's state schema keys", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const keys = fieldset.getStateSchemaKeys();

      expect(Object.keys(keys)).to.equal(["line1", "line2", "address"]);
    });
  });

  describe("getFormDataFromState", () => {
    it("returns undefined when the fieldset's own key is absent from state", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const state = { line1: "123 Street", line2: "Townsville" };

      const formData = fieldset.getFormDataFromState(state);

      expect(formData).to.equal(undefined);
    });

    it("reads children from state nested under the fieldset's own key", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const state = { address: { line1: "123 Street", line2: "Townsville" } };

      const formData = fieldset.getFormDataFromState(state);

      expect(formData).to.equal({
        address: { line1: "123 Street", line2: "Townsville" },
      });
    });
  });

  describe("getStateValueFromValidForm / getStateFromValidForm", () => {
    it("returns the children's state merged together, keyed by child name", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const payload = { line1: "123 Street", line2: "Townsville" };

      const value = fieldset.getStateValueFromValidForm(payload);

      expect(value).to.equal({ line1: "123 Street", line2: "Townsville" });
    });

    it("nests that merged child state under the fieldset name", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const payload = { line1: "123 Street", line2: "Townsville" };

      const state = fieldset.getStateFromValidForm(payload);

      expect(state).to.equal({
        address: { line1: "123 Street", line2: "Townsville" },
      });
    });

    it("strips the synthetic carrier field used for cross-field validation", () => {
      const fieldset = new Fieldset(
        componentDefinitionWithValidation,
        formModel
      );
      const payload = {
        line1: "123 Street",
        line2: "Townsville",
        address: "synthetic carrier value",
      };

      const value = fieldset.getStateValueFromValidForm(payload);

      expect(value).to.equal({ line1: "123 Street", line2: "Townsville" });
    });

    it("coerces a missing/blank optional child value to an empty string instead of null", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const payload = { line1: "123 Street" }; // line2 omitted, and optional

      const value = fieldset.getStateValueFromValidForm(payload);

      expect(value).to.equal({ line1: "123 Street", line2: "" });
    });
  });

  describe("getDisplayStringFromState", () => {
    it("reads children from state nested under the fieldset's own key, joining their display strings", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const state = { address: { line1: "123 Street", line2: "Townsville" } };

      const display = fieldset.getDisplayStringFromState(state);

      expect(display).to.equal("123 Street, Townsville");
    });

    it("returns an empty string when the fieldset's own key is absent from state", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const state = { line1: "123 Street", line2: "Townsville" };

      const display = fieldset.getDisplayStringFromState(state);

      expect(display).to.equal("");
    });

    it("skips children whose display string is blank or whitespace-only", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const state = { address: { line1: "123 Street", line2: "   " } };

      const display = fieldset.getDisplayStringFromState(state);

      expect(display).to.equal("123 Street");
    });
  });

  describe("getViewModel (round-trip from persisted state)", () => {
    it("pre-fills children with previously submitted values when the page is reloaded via GET", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const payload = { line1: "123 Street", line2: "Townsville" };

      // What gets persisted to session state on submit (Fieldset.getStateFromValidForm)
      const persistedState = fieldset.getStateFromValidForm(payload);

      // What PageControllerBase.getFormDataFromState builds for a GET render from that state
      const formData: any = fieldset.getFormDataFromState(persistedState);
      formData.lang = "en";

      // What the page controller passes straight into the view
      const viewModel = fieldset.getViewModel(formData, undefined);
      const line1Item: any = viewModel.items.find(
        (item: any) => item.name === "line1"
      );
      const line2Item: any = viewModel.items.find(
        (item: any) => item.name === "line2"
      );

      expect(line1Item?.value).to.equal("123 Street");
      expect(line2Item?.value).to.equal("Townsville");
    });

    it("still re-displays typed values from a flat raw payload after a validation error", () => {
      const fieldset = new Fieldset(componentDefinition, formModel);
      const formData: any = { line1: "123 Street", line2: "", lang: "en" };

      const viewModel = fieldset.getViewModel(formData, undefined);
      const line1Item: any = viewModel.items.find(
        (item: any) => item.name === "line1"
      );

      expect(line1Item?.value).to.equal("123 Street");
    });

    it("still re-displays typed values from a flat raw payload that includes the synthetic carrier field", () => {
      const fieldset = new Fieldset(
        componentDefinitionWithValidation,
        formModel
      );
      const formData: any = {
        line1: "123 Street",
        line2: "",
        address: "", // the carrier field's own submitted (string) value
        lang: "en",
      };

      const viewModel = fieldset.getViewModel(formData, undefined);
      const line1Item: any = viewModel.items.find(
        (item: any) => item.name === "line1"
      );

      expect(line1Item?.value).to.equal("123 Street");
    });
  });
});
