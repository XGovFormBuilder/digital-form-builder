import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";
import { addClassOptionIfNone } from "./helpers";
import joi, { Schema } from "joi";

const EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

export class EmailAddressField extends FormComponent {
  formSchema;
  stateSchema;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    this.schema["email"] = true;

    addClassOptionIfNone(this.options, "govuk-input--width-20");

    // Define Joi schema for email validation
    let emailSchema = joi.string();

    if (this.options.required === false) {
      emailSchema = emailSchema.allow("").allow(null);
    }

    const pattern = new RegExp(EMAIL_REGEX);
    emailSchema = emailSchema.pattern(pattern);

    if (this.options.customValidationMessages) {
      emailSchema = emailSchema.messages(this.options.customValidationMessages);
    }

    this.formSchema = emailSchema;
    this.stateSchema = emailSchema;
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
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
    viewModel.autocomplete = this.options.autocomplete
      ? this.options.autocomplete
      : "email";

    return viewModel;
  }
}
