import { Schema } from "joi";
import { Data, InputFieldsComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { addClassOptionIfNone } from "./helpers";
import { FormModel } from "../models";

export class YesNoField extends FormComponent {
  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    const data = new Data(model.def);
    const { options, values } = this;

    this.values = data.valuesFor(def)?.toStaticValues();
    const isRequired =
      "required" in options && options.required === false ? false : true;

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
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name, values } = this;
    const value = state[name];
    const item = values?.items.find((item) => item.value === value);
    return item ? item.label : "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
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
