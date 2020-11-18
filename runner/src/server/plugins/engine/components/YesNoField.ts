import { Data, InputFieldsComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormSubmissionErrors, FormSubmissionState } from "../types";
import { addClassOptionIfNone } from "./helpers";
import { FormModel } from "..";

export class YesNoField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
    super(def, model);
    const data = new Data(model.def);
    const { options, values } = this;

    this.values = data.valuesFor(def)?.toStaticValues();
    const isRequired = "required" in options && options.required !== false;

    const validValues = values?.items.map((item) => item.value) || [];
    const formSchema = helpers
      .buildFormSchema(values?.valueType, this, isRequired)
      .valid(...validValues);
    const stateSchema = helpers
      .buildStateSchema(values?.valueType, this)
      .valid(...validValues);

    this.formSchema = formSchema;
    this.stateSchema = stateSchema;

    addClassOptionIfNone(this.options, "govuk-radios--inline");
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name, values } = this;
    const value = state[name];
    const item = values?.items.find((item) => item.value === value);
    return item ? item.label : "";
  }

  getViewModel(formData, errors: FormSubmissionErrors) {
    const { name, values } = this;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = values?.items.map((item) => ({
      text: item.label,
      value: item.value,
      // Do a loose string based check as state may or
      // may not match the item value types.
      checked: "" + item.value === "" + formData[name],
    }));

    return viewModel;
  }
}
