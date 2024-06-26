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

    if (options.required === false) {
      // null or empty string is valid for optional fields
      schema = schema
        .empty(null)
        .items(joi[this.listType]().allow(...this.values, ""));
    } else {
      schema = schema
        .items(joi[this.listType]().allow(...this.values))
        .required();
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
    let formDataItems = (formData[this.name] ?? "").split(",");
    viewModel.items = (viewModel.items ?? []).map((item) => ({
      ...item,
      checked: !!formDataItems.find((i) => `${item.value}` === i),
    }));

    return viewModel;
  }
}
