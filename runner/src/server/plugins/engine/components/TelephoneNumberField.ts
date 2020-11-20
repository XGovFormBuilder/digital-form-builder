import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import { FormData, FormSubmissionErrors } from "../types";

const PATTERN = "^[0-9\\s\\+\\(\\)]*$";

export class TelephoneNumberField extends FormComponent {
  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    this.schema["regex"] = PATTERN;
    addClassOptionIfNone(this.options, "govuk-input--width-10");
  }

  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const schema: any = this.schema;
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "tel",
    };

    if (schema.max) {
      viewModel.attributes = {
        maxlength: schema.max,
      };
    }

    return viewModel;
  }
}
