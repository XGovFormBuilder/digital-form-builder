import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import Joi, { Schema, StringSchema } from "joi";
import { MultilineTextFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import { MultilineTextFieldViewModel } from "server/plugins/engine/components/types";

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
  isCharacterOrWordCount: boolean = false;

  constructor(def: MultilineTextFieldComponent, model: FormModel) {
    super(def, model);
    const { schema = {}, options } = def;
    this.options = options;
    this.schema = schema;
    let componentSchema = Joi.string()
      .label(def.title.toLowerCase())
      .required();

    if (options.required === false) {
      componentSchema = componentSchema.allow("").allow(null);
    }

    if (schema.max) {
      componentSchema = componentSchema.max(schema.max);
      this.isCharacterOrWordCount = true;
    }

    if (schema.min) {
      componentSchema = componentSchema.min(schema.min);
    }

    if (options.maxWords ?? false) {
      componentSchema = componentSchema.custom((value, helpers) => {
        if (inputIsOverWordCount(value, options.maxWords)) {
          helpers.error("string.maxWords");
        }
        return value;
      }, "max words validation");
      this.isCharacterOrWordCount = true;
    }

    if (options.customValidationMessage) {
      componentSchema = componentSchema.rule({
        message: options.customValidationMessage,
      });
    }

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

  getViewModel(
    formData: FormData,
    errors: FormSubmissionErrors
  ): MultilineTextFieldViewModel {
    const schema = this.schema;
    const options = this.options;
    const viewModel = super.getViewModel(
      formData,
      errors
    ) as MultilineTextFieldViewModel;
    viewModel.isCharacterOrWordCount = this.isCharacterOrWordCount;

    if (schema.max ?? false) {
      viewModel.maxlength = schema.max;
    }

    if (options.rows ?? false) {
      viewModel.rows = options.rows;
    }

    if (options.maxWords ?? false) {
      viewModel.maxwords = options.maxWords;
    }
    return viewModel;
  }
}
