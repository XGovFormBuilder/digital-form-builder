import { InputFieldsComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormModel } from "../formModel";
import { addClassOptionIfNone } from "./helpers";
import { FormSubmissionErrors } from "../types";

const PATTERN = "^[0-9\\s\\+\\(\\)]*$";

export class TelephoneNumberField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
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

  getViewModel(formData, errors: FormSubmissionErrors) {
    const schema: any = this.schema;
    const viewModel = super.getViewModel(formData, errors);

    if (typeof schema.max === "number") {
      viewModel.attributes = {
        maxlength: schema.max,
      };
    }

    viewModel.type = "tel";

    return viewModel;
  }
}
