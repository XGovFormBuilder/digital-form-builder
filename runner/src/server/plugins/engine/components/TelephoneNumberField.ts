import { TelephoneNumberFieldComponent } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormModel } from "../models";
import { addClassOptionIfNone, internationalPhoneValidator } from "./helpers";
import { FormData, FormSubmissionErrors } from "../types";
import joi, { Schema } from "joi";

const TELEPHONE_REGEX =
  "\\^\\(\\(\\(\\+44s\\?\\(\\?!4\\|6\\)d\\{4\\}\\|\\(\\?0\\(\\?!4\\|6\\)d\\{4\\}\\)\\?\\)s\\?d\\{3\\}s\\?d\\{3\\}\\)\\|\\(\\(\\+44s\\?\\(\\?!4\\|6\\)d\\{3\\}\\|\\(\\?0\\(\\?!4\\|6\\)d\\{3\\}\\)\\?\\)s\\?d\\{3\\}s\\?d\\{4\\}\\)\\|\\(\\(\\+44s\\?\\(\\?!4\\|6\\)d\\{2\\}\\|\\(\\?0\\(\\?!4\\|6\\)d\\{2\\}\\)\\?\\)s\\?d\\{4\\}s\\?d\\{4\\}\\)\\)\\(s\\?\\#\\(d\\{4\\}\\|d\\{3\\}\\)\\)\\?\\$";
export class TelephoneNumberField extends FormComponent {
  constructor(def: TelephoneNumberFieldComponent, model: FormModel) {
    super(def, model);

    const { options = {}, schema = {} } = def;
    let componentSchema = joi.string();

    if (options.required === false) {
      componentSchema = componentSchema.allow("").allow(null);
    }

    const pattern = new RegExp(TELEPHONE_REGEX);
    componentSchema = componentSchema.pattern(pattern);

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

    addClassOptionIfNone(this.options, "govuk-input--width-20");
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
