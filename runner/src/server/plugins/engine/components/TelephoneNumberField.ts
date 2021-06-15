import { TelephoneNumberFieldComponent } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import { FormData, FormSubmissionErrors } from "../types";
import joi, { Schema } from "joi";

const PATTERN = /^[0-9\\s+()-]*$/;
const DEFAULT_MESSAGE = "Enter a telephone number in the correct format";
export class TelephoneNumberField extends FormComponent {
  constructor(def: TelephoneNumberFieldComponent, model: FormModel) {
    super(def, model);

    const { options = {} } = def;

    let componentSchema = joi
      .string()
      .pattern(PATTERN)
      .rule({
        message: def.options?.customValidation ?? DEFAULT_MESSAGE,
      })
      .label(def.title);

    if (options.required !== false) {
      componentSchema = componentSchema.required();
    } else {
      componentSchema = componentSchema.allow("");
    }

    if (def.schema?.max) {
      componentSchema.length(def.schema.max);
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
