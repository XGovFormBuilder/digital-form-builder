import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import { FormData, FormSubmissionErrors } from "../types";
import { Schema } from "joi";

export class TimeField extends FormComponent {
  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-4");
    const { options } = def;
    let componentSchema = helpers.getFormSchemaKeys(this.name, "string", this)[
      this.name
    ];
    if (options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        options.customValidationMessages
      );
    }
    this.formSchema = componentSchema;
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "time",
    };

    return viewModel;
  }
}
