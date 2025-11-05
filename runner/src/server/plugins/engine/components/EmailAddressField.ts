import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";
import {
  getStateSchemaKeys,
  getFormSchemaKeys,
  addClassOptionIfNone,
} from "./helpers";

export class EmailAddressField extends FormComponent {
  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    this.schema["email"] = true;
    addClassOptionIfNone(this.options, "govuk-input--width-20");
  }

  getFormSchemaKeys() {
    return getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const schema = this.schema;
    const viewModel = super.getViewModel(formData, errors);

    if ("max" in schema && schema.max) {
      viewModel.attributes = {
        maxlength: schema.max,
      };
    }

    viewModel.type = "email";
    viewModel.autocomplete = this.options.autocomplete ?  this.options.autocomplete : "email";

    return viewModel;
  }
}
