import { InputFieldsComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormModel } from "../formModel";

const PATTERN = "^[0-9\\s\\+\\(\\)]*$";

export class TelephoneNumberField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
    super(def, model);
    const { options, schema } = this;

    if (!options.classes) {
      options.classes = "govuk-input--width-10";
    }

    schema.regex = PATTERN;
  }

  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData, errors) {
    const { schema } = this;
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
