import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import joi from "joi";
import { SelectionControlField } from "server/plugins/engine/components/SelectionControlField";

export class CheckboxesField extends SelectionControlField {
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
    return state?.[this.name]?.join(", ");
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
