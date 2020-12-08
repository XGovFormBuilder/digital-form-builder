import joi from "joi";
import * as helpers from "./helpers";

import { FormModel } from "../models";
import { ConditionalFormComponent } from "./ConditionalFormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListComponentsDef } from "@xgovformbuilder/model";

export class CheckboxesField extends ConditionalFormComponent {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    const { options, values, itemValues } = this;

    if (!values?.valueType) {
      throw new Error("Component valueType is missing");
    }

    const itemSchema = joi[values.valueType]().valid(...itemValues);
    const itemsSchema = joi.array().items(itemSchema);
    const alternatives = joi.alternatives([itemSchema, itemsSchema]);
    const isRequired =
      "required" in options && options.required === false ? false : true;

    this.formSchema = helpers.buildFormSchema(alternatives, this, isRequired);
    this.stateSchema = helpers.buildStateSchema(alternatives, this);
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name, values } = this;

    if (name in state) {
      const value = state[name];

      if (value === null) {
        return "";
      }

      const checked = Array.isArray(value) ? value : [value];
      return checked
        .map((check) => {
          const item = values?.items.find((item) => item.value === check);
          return item?.label;
        })
        .join(", ");
    }

    return "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, values } = this;
    const viewModel = super.getViewModel(formData, errors);
    let formDataItems = [];

    if (name in formData) {
      formDataItems = Array.isArray(formData[name])
        ? formData[name]
        : formData[name].split(",");
    }

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = values?.items.map((item) => {
      const itemModel: any = {
        text: this.localisedString(item.label),
        value: item.value,
        checked: !!formDataItems.find((i) => `${item.value}` === i),
        condition: item.condition,
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

      return super.addConditionalComponents(item, itemModel, formData, errors);
    });

    return viewModel;
  }
}
