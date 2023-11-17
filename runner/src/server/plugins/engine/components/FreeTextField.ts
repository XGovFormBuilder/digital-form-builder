import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import Joi, { Schema, StringSchema } from "joi";
import { FreeTextFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import { FreeTextFieldViewModel } from "server/plugins/engine/components/types";
import { DataType } from "./types";

// this must match the front-end, or we'll have discrepancies
// runner\src\server\plugins\engine\views\components\freetextfield.html
function inputIsOverWordCount(input, maxWords) {
  /**
   * This validation is copied from the govuk-frontend library to match their client side behaviour
   * the {@link https://github.com/alphagov/govuk-frontend/blob/e1612b13771fb7ca9a58ee85393aec94a1849335/src/govuk/components/character-count/character-count.js#L91 | govuk-frontend} library
   */
  // This peice of regex will remove all the html elements and entitys to get a accurate word count
  input = input.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
  const maxWordCount = parseInt(maxWords);
  const wordCount = (input.match(/\S+/g) || []).length;
  return wordCount > maxWordCount;
}

export class FreeTextField extends FormComponent {
  formSchema: StringSchema;
  options: FreeTextFieldComponent["options"];
  schema: FreeTextFieldComponent["schema"];
  customValidationMessage?: string;
  dataType = "freeText" as DataType;
  isCharacterOrWordCount: boolean = false;

  constructor(def: FreeTextFieldComponent, model: FormModel) {
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

    if (maxWords ?? false) {
      this.formSchema = this.formSchema.custom((value, helpers) => {
        if (inputIsOverWordCount(value, maxWords)) {
          return helpers.error("string.maxWords", { limit: maxWords });
        }
        return value;
      }, "max words validation");
      this.isCharacterOrWordCount = true;
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

  getViewModel(
    formData: FormData,
    errors: FormSubmissionErrors
  ): FreeTextFieldViewModel {
    const schema = this.schema;
    const options = this.options;

    const viewModel = super.getViewModel(
      formData,
      errors
    ) as FreeTextFieldViewModel;
    viewModel.isCharacterOrWordCount = this.isCharacterOrWordCount;

    if (options.rows ?? false) {
      viewModel.rows = options.rows;
    }

    if (options.maxWords ?? false) {
      viewModel.maxWords = options.maxWords;
    }
    if (options.hideTitle) {
      viewModel.label = { text: "", html: viewModel.hint?.html!, classes: "" };
    }
    return viewModel;
  }
}
