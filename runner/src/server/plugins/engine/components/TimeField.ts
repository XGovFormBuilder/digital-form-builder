import { InputFieldsComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormModel } from "../formModel";
import { addClassOptionIfNone } from "./helpers";
import { FormSubmissionErrors } from "../types";

export class TimeField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-4");
  }

  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    viewModel.type = "time";

    return viewModel;
  }
}
