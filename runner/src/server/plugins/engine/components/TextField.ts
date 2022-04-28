import {
  InputFieldsComponentsDef,
  TextFieldComponent,
} from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import { FormModel } from "../models";
import {
  addClassOptionIfNone,
  buildFormSchema,
  buildStateSchema,
} from "./helpers";
import joi, { Schema } from "joi";

const ERROR_MESSAGE = "String entered does not match the pattern provided";
export class TextField extends FormComponent {
  formSchema;
  stateSchema;
  options: TextFieldComponent["options"];

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    this.options = def.options;
    this.schema = def.schema;

    const { schema } = this;
    let componentSchema = joi.string();

    addClassOptionIfNone(this.options, "govuk-input--width-20");

    let pattern = !schema["regex"] ? '^[^"\\/\\#;]*$' : schema["regex"];
    if (pattern !== '^[^"\\/\\#;]*$') {
      pattern = pattern.toString();
      if (pattern.charAt(0) !== '^') {
        pattern = pattern.padStart(pattern.length + 1, '^');
      }

      if (pattern.charAt(pattern.length - 1) !== '$') {
        pattern = pattern.padEnd(pattern.length + 1, '$');
      }
      
      const regex = new RegExp(pattern);
      componentSchema = componentSchema
      .pattern(regex, { name: 'string' })
      .message(ERROR_MESSAGE);
    }

    this.schema = componentSchema;
  }

  getFormSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.schema as Schema };
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
