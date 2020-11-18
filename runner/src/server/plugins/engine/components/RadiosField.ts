import { ListComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { ConditionalFormComponent } from "./ConditionalFormComponent";
import { FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormModel } from "../formModel";

export class RadiosField extends ConditionalFormComponent {
  constructor(def: ListComponents, model: FormModel) {
    super(def, model);

    const { options, values, itemValues } = this;

    const valueType = values.valueType;
    const formSchema = helpers
      .buildFormSchema(valueType, this, options.required !== false)
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
    const item = values.items.find((item) => item.value === value);
    return item ? item.label : value;
  }

  getViewModel(formData, errors?: FormSubmissionErrors) {
    const { name, values, options } = this;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = values.items.map((item) => {
      // TODO use itemModel type? Same as checkbox field
      const itemModel: any = {
        html: this.localisedString(item.label),
        value: item.value,
        // Do a loose string based check as state may or
        // may not match the item item types.
        checked: "" + item.value === "" + formData[name],
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
