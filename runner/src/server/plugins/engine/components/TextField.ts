import { TextFieldComponent } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import joi, { Schema } from "joi";

export class TextField extends FormComponent {
  formSchema;
  stateSchema;

  constructor(def: TextFieldComponent, model: FormModel) {
    super(def, model);

    const { options, schema = {} } = def;
    this.options = options;
    this.schema = schema;

    addClassOptionIfNone(this.options, "govuk-input--width-10");

    let componentSchema = joi.string().required();

    if (options.required === false) {
      componentSchema = componentSchema.optional().allow("").allow(null);
    }

    componentSchema = componentSchema.label(def.title);

    if (options.customValidationMessage) {
      componentSchema = componentSchema.label(options.customValidationMessage);
    }

    if (schema.max) {
      componentSchema = componentSchema.max(schema.max);
    }

    if (schema.min) {
      componentSchema = componentSchema.min(schema.min);
    }

    if (schema.regex) {
      const pattern = new RegExp(schema.regex);
      componentSchema.pattern(pattern);
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
    const options: any = this.options;
    const schema: any = this.schema;
    const viewModel = super.getViewModel(formData, errors);

    if (schema.max) {
      viewModel.attributes = {
        maxlength: schema.max,
      };
    }

    if (options.autocomplete) {
      viewModel.autocomplete = options.autocomplete;
    }

    return viewModel;
  }
}
