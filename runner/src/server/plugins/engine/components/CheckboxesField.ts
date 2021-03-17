import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListFormComponent } from "./ListFormComponent";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import joi from "joi";

export class CheckboxesField extends ListFormComponent {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);

    let schema = joi
      .array()
      .items(joi[this.listType]().allow(...this.values))
      .single()
      .label(def.title);

    if (def.options.required !== false) {
      schema = schema.required();
    }

    this.formSchema = schema;
    this.stateSchema = schema;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name } = this;
    const value = state[name];
    const checked = Array.isArray(value) ? value : [value];

    return checked
      .map((check) => {
        const item = this.items.find((item) => item.value === check);
        return item?.value;
      })
      .filter((c) => c);
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name } = this;
    let viewModel = super.getViewModel(formData, errors);
    let answers = formData[name] ?? [];
    let formDataItems = Array.isArray(formData) ? answers : [answers];

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = viewModel.items.map((item) => {
      const itemModel = {
        ...item,
        checked: !!formDataItems.find((i) => `${item.value}` === i),
      };
      if ("bold" in this.options && this.options.bold) {
        itemModel.label = {
          classes: "govuk-label--s",
        };
      }
      if (item.hint) {
        itemModel.hint = {
          html: this.localisedString(item.hint),
        };
      }
      /**
       * TODO:- reintroduce addConditionalComponents when conditional reveals are fixed by GDS.
       * //return super.addConditionalComponents(item, itemModel, formData, errors);
       */
      return itemModel;
    });

    return viewModel;
  }
}
