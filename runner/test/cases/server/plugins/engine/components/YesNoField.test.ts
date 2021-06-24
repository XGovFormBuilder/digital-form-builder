import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { YesNoField } from "server/plugins/engine/components/YesNoField";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it } = lab;
import sinon from "sinon";

suite("YesNoField", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "YesNoField",
      name: "speakEnglish",
      title: "Speak English?",
      options: {},
      schema: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
      getList: () => ({
        name: "__yesNo",
        title: "Yes/No",
        type: "boolean",
        items: [
          {
            text: "Yes",
            value: true,
          },
          {
            text: "No",
            value: false,
          },
        ],
      }),
    };

    describe("getViewModel", () => {
      const viewModel = {
        attributes: {},
        label: {
          text: "Do you speak English?",
          classes: "govuk-label--s",
        },
        id: "speakEnglish",
        name: "speakEnglish",
        value: "true",
        hint: {
          html:
            "You can only be added to the Find a Lawyer Abroad service if you have excellent English language skills. ",
        },
        classes: "govuk-radios--inline",
        items: [
          {
            text: "Yes",
            value: true,
            checked: true,
          },
          {
            text: "No",
            value: false,
            checked: false,
          },
        ],
        fieldset: {
          legend: {
            text: "Do you speak English?",
            classes: "govuk-label--s",
          },
        },
      };

      it("viewModel item Yes is checked when evaluating boolean true", () => {
        const component = new YesNoField(componentDefinition, formModel);
        const formData = {
          speakEnglish: true,
          lang: "en",
        };

        const viewModel = component.getViewModel(formData);
        const yesItem = viewModel.items.filter(
          (item) => item.text === "Yes"
        )[0];

        expect(yesItem).to.equal({
          text: "Yes",
          value: true,
          checked: true,
        });
      });

      it("viewModel item Yes is checked when evaluating string 'true'", () => {
        const component = new YesNoField(componentDefinition, formModel);
        const formData = {
          speakEnglish: "true",
          lang: "en",
        };

        const viewModel = component.getViewModel(formData);
        const yesItem = viewModel.items.filter(
          (item) => item.text === "Yes"
        )[0];

        expect(yesItem).to.equal({
          text: "Yes",
          value: true,
          checked: true,
        });
      });

      it("viewModel item No is checked when evaluating boolean false", () => {
        const component = new YesNoField(componentDefinition, formModel);
        const formData = {
          speakEnglish: false,
          lang: "en",
        };

        const viewModel = component.getViewModel(formData);
        const noItem = viewModel.items.filter((item) => item.text === "No")[0];

        expect(noItem).to.equal({
          text: "No",
          value: false,
          checked: true,
        });
      });

      it("viewModel item No is checked when evaluating string 'false'", () => {
        const component = new YesNoField(componentDefinition, formModel);
        const formData = {
          speakEnglish: "false",
          lang: "en",
        };

        const viewModel = component.getViewModel(formData);
        const noItem = viewModel.items.filter((item) => item.text === "No")[0];

        expect(noItem).to.equal({
          text: "No",
          value: false,
          checked: true,
        });
      });
    });
  });
});
