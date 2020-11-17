import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormSubmissionState, FormSubmissionErrors } from "../types";

export class SelectField extends FormComponent {
  constructor(def, model) {
    super(def, model);

    const { values } = this;
    const formSchema = helpers.buildFormSchema(
      "string" /* values.valueType */,
      this
    ); // .valid(values.items.map(item => item.value))
    const stateSchema = helpers
      .buildStateSchema(values.valueType, this)
      .valid(...values.items.map((item) => item.value));

    this.items = values.items;
    this.formSchema = formSchema;
    this.stateSchema = stateSchema;
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
    const item = values.items.find((item) => item.value === value);
    return item ? item.text : "";
  }

  getViewModel(formData, errors?: FormSubmissionErrors) {
    const { name, values } = this;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.items = [{ text: "" }].concat(
      values.items.map((item) => ({
        text: this.localisedString(item.label),
        value: item.value,
        // Do a loose check as state may or
        // may not match the item value types
        selected: "" + item.value === "" + formData[name],
        condition: item.condition,
      }))
    );

    return viewModel;
  }
}
