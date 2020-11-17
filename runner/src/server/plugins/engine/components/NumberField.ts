import { FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import { getFormSchemaKeys, getStateSchemaKeys } from "./helpers";

export class NumberField extends FormComponent {
  getFormSchemaKeys() {
    return getFormSchemaKeys(this.name, "number", this);
  }

  getStateSchemaKeys() {
    return getStateSchemaKeys(this.name, "number", this);
  }

  getViewModel(formData, errors) {
    const viewModel = super.getViewModel(formData, errors);
    const { precision } = this.schema;

    viewModel.type = "number";

    if (precision) {
      viewModel.attributes.step = "0." + "1".padStart(precision, "0");
    }

    return viewModel;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state[this.name] || state[this.name] === 0
      ? state[this.name].toString()
      : undefined;
  }
}
