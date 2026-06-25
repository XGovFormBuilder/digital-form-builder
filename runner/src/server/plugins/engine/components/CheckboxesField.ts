import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import joi from "joi";
import { SelectionControlField } from "server/plugins/engine/components/SelectionControlField";

export class CheckboxesField extends SelectionControlField {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);

    const { options } = def;

    let schema = joi.array().single().label(def.title.toLowerCase());

    schema = schema.items(joi[this.listType]().allow(...this.values));

    if (options.required === false) {
      schema = schema.empty(null).allow("");
    } else {
      schema = schema.required();
    }

    if (options.finalValue) {
      schema = schema.custom((value, helpers) =>
        value.includes(options.finalValue) && value.length > 1
          ? helpers.error("any.invalid")
          : value
      );
    }

    if (options.customValidationMessages) {
      schema = schema.messages(options.customValidationMessages);
    }

    this.formSchema = schema;
    this.stateSchema = schema;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state?.[this.name]
      ?.map(
        (value) =>
          this.items.find((item) => `${item.value}` === `${value}`)?.text ?? ""
      )
      .join(", ");
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    let value = formData[this.name];
    let formDataItems;
    if (Array.isArray(value)) {
      formDataItems = value; // Already an array, no need to split
    } else {
      formDataItems = (formData[this.name] ?? "").split(",");
    }

    // Get the original items array
    const items = viewModel.items ?? [];

    // Uses https://github.com/alphagov/govuk-design-system/blob/main/src/components/checkboxes/with-none-option/index.njk
    // to handle divider and "None" option
    viewModel.items = (viewModel.items ?? items).map((item, index, arr) => ({
      ...item,
      checked: formDataItems.includes(`${item.value}`),
      ...(this.options.divider &&
        index === arr.length - 1 && { behaviour: "exclusive" }),
      ...(this.options.divider &&
        index === arr.length - 2 && { divider: "or" }),
    }));

    return viewModel;
  }
}
