import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import Joi, { Schema, StringSchema } from "joi";
import { MultilineTextFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";

function inputIsOverWordCount(input, maxWords) {
  /**
   * This validation is copied from the govuk-frontend library to match their client side behaviour
   * the {@link https://github.com/alphagov/govuk-frontend/blob/e1612b13771fb7ca9a58ee85393aec94a1849335/src/govuk/components/character-count/character-count.js#L91 | govuk-frontend} library
   */
  const wordCount = input.match(/\S+/g).length || 0;
  return maxWords > wordCount;
}

export class MultilineTextField extends FormComponent {
  formSchema: StringSchema;
  options: MultilineTextFieldComponent["options"];
  schema: MultilineTextFieldComponent["schema"];
  customValidationMessage?: string;

  constructor(def: MultilineTextFieldComponent, model: FormModel) {
    super(def, model);
    this.options = def.options;
    this.schema = def.schema;
    this.formSchema = Joi.string();
    this.formSchema = this.formSchema.label(def.title);
    const { maxWords, customValidationMessage } = def.options;

    const isRequired = def.options.required ?? true;

    if (isRequired) {
      this.formSchema = this.formSchema.required();
    } else {
      this.formSchema = this.formSchema.allow("").allow(null);
    }
    this.formSchema = this.formSchema.ruleset;

    if (def.schema.max) {
      this.formSchema = this.formSchema.max(def.schema.max);
    }

    if (def.schema.min) {
      this.formSchema = this.formSchema.min(def.schema.min);
    }

    if (maxWords ?? false) {
      this.formSchema = this.formSchema.custom((value, helpers) => {
        if (inputIsOverWordCount(value, maxWords)) {
          helpers.error("string.maxWords");
        }
        return value;
      }, "bloop");
    }

    if (customValidationMessage) {
      this.formSchema = this.formSchema.rule({
        message: customValidationMessage,
      });
    }
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const schema = this.schema;
    const options = this.options;
    const viewModel = super.getViewModel(formData, errors);
    let attributes: { [key: string]: any } = {};

    if (schema.max ?? false) {
      attributes.max = schema.max;
    }

    if (options.rows ?? false) {
      viewModel.rows = options.rows;
    }

    if (options.maxWords ?? false) {
      attributes.maxwords = options.maxWords;
    }

    viewModel.attributes = attributes;

    return viewModel;
  }
}
