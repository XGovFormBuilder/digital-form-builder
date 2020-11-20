import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";

export class TimeField extends FormComponent {
  constructor(def, model) {
    super(def, model);
    const { options } = this;

    if (!options.classes) {
      options.classes = "govuk-input--width-4";
    }
  }

  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData, errors) {
    const viewModel = super.getViewModel(formData, errors);

    viewModel.type = "time";

    return viewModel;
  }
}
