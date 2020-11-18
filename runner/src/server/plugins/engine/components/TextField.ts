import { InputFieldsComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormSubmissionErrors } from "../types";
import { FormModel } from "../formModel";

export class TextField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
    super(def, model);
    const { options, schema } = this;

    if (!options.classes) {
      options.classes = "govuk-input--width-20";
    }

    if (!schema.regex) {
      schema.regex = '^[^"\\/\\#;]*$';
    }
  }

  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData, errors?: FormSubmissionErrors) {
    const { schema } = this;
    const viewModel = super.getViewModel(formData, errors);

    if (typeof schema.max === "number") {
      viewModel.attributes = {
        maxlength: schema.max,
      };
    }
    return viewModel;
  }
}
