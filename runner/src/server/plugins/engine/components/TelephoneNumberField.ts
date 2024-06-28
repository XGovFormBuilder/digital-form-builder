import { TelephoneNumberFieldComponent } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormModel } from "../models";
import { addClassOptionIfNone, internationalPhoneValidator } from "./helpers";
import { FormData, FormSubmissionErrors } from "../types";
import joi, { Schema } from "joi";

/**
 * ^((\+\d{0,4})|(0))[0-9\s()+]{0,20}$
 * ((\+\d{0,4})|(0)) - Matches country code or start with 0
 * [0-9\s()+]{0,20}$ - Allows for up to 20 characters of number, space, brackets or plus
 *   This should cater for interntional numbers without being too specific
 */

const PATTERN = /^((\+\d{0,4})|(0))[0-9\s()+]{0,20}$/;
const DEFAULT_MESSAGE = "Enter a telephone number in the correct format";
export class TelephoneNumberField extends FormComponent {
  constructor(def: TelephoneNumberFieldComponent, model: FormModel) {
    super(def, model);

    const { options = {}, schema = {} } = def;
    const pattern = schema.regex ? new RegExp(schema.regex) : PATTERN;
    let componentSchema = joi.string();

    if (options.required === false) {
      componentSchema = componentSchema.allow("").allow(null);
    }
    componentSchema = componentSchema
      .pattern(pattern)
      .message(def.options?.customValidationMessage ?? DEFAULT_MESSAGE)
      .label(def.title);

    if (schema.max) {
      componentSchema = componentSchema.max(schema.max);
    }

    if (schema.min) {
      componentSchema = componentSchema.min(schema.min);
    }

    if (options.isInternational) {
      componentSchema = componentSchema.custom(internationalPhoneValidator);
    }

    if (options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        options.customValidationMessages
      );
    }
    this.schema = componentSchema;

    addClassOptionIfNone(this.options, "govuk-input--width-10");
  }

  getFormSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "tel",
      autocomplete: "tel",
    };

    return viewModel;
  }
}
