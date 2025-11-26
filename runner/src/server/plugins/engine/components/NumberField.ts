import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import joi, { Schema } from "joi";
import { NumberFieldComponent } from "@xgovformbuilder/model";

export class NumberField extends FormComponent {
  schemaOptions: NumberFieldComponent["schema"];
  options: NumberFieldComponent["options"];

  constructor(def, model) {
    super(def, model);

    const { schema = {}, options } = def;

    this.schemaOptions = schema;
    this.options = options;
    const { min, max, integer } = schema;
    let componentSchema = joi.number();

    componentSchema = componentSchema.label(def.title.toLowerCase());

    if (min !== null && min !== undefined) {
      componentSchema = componentSchema.min(min);
    }

    if (max !== null && max !== undefined) {
      componentSchema = componentSchema.max(max);
    }

    // Add this block to enforce integer validation
    if (integer === true) {
      componentSchema = componentSchema.integer();
    }

    if (options.customValidationMessage) {
      componentSchema = componentSchema.rule({
        message: def.options.customValidationMessage,
      });
    }

    if (options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        options.customValidationMessages
      );
    }

    if (def.options.required === false) {
      const optionalSchema = componentSchema.allow(null).allow("").optional();
      this.schema = optionalSchema;
    } else {
      this.schema = componentSchema;
    }
  }

  getFormSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const schema: any = this.schema;
    const options: any = this.options;
    const { suffix, prefix } = options;
    const viewModelPrefix = { prefix: { text: prefix } };
    const viewModelSuffix = { suffix: { text: suffix } };
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "number",
      // ...False returns nothing, so only adds content when
      // the given options are present.
      ...(options.prefix && viewModelPrefix),
      ...(options.suffix && viewModelSuffix),
    };

    if (this.schemaOptions.precision) {
      viewModel.attributes.step = "0." + "1".padStart(schema.precision, "0");
    }

    return viewModel;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state[this.name] || state[this.name] === 0
      ? state[this.name].toString()
      : undefined;
  }
}
