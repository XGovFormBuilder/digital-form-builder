import { ListComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { ConditionalFormComponent } from "./ConditionalFormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormModel } from "../models";

export class RadiosField extends ConditionalFormComponent {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);

    const { options, values, itemValues } = this;
    const isRequired =
      "required" in options && options.required === false ? false : true;

    const valueType = values?.valueType;
    const formSchema = helpers
      .buildFormSchema(valueType, this, isRequired)
      .valid(...itemValues);
    const stateSchema = helpers
      .buildStateSchema(valueType, this)
      .valid(...itemValues);

    this.formSchema = formSchema;
    this.stateSchema = stateSchema;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name, values } = this;
    const value = state[name];
    const item = values?.items.find((item) => item.value === value);
    return item ? item.label : value;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, values } = this;
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = values?.items.map((item) => {
      const itemModel: any = {
        html: this.localisedString(item.label),
        value: item.value,
        checked: `${item.value}` === `${formData[name]}`,
        condition: item.condition,
      };

      if (options.bold) {
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
