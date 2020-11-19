import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import { getFormSchemaKeys, getStateSchemaKeys } from "./helpers";

export class NumberField extends FormComponent {
  getFormSchemaKeys() {
    return getFormSchemaKeys(this.name, "number", this);
  }

  getStateSchemaKeys() {
    return getStateSchemaKeys(this.name, "number", this);
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const schema: any = this.schema;
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "number",
    };

    if (schema.precision) {
      viewModel.attributes.step = "0." + "1".padStart(schema.precision, "0");
    }

    return viewModel;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state[this.name] || state[this.name] === 0
      ? state[this.name].toString()
      : undefined;
  }
}
