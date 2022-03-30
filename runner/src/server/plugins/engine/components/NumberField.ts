import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import joi, { Schema } from "joi";
import { NumberFieldComponent } from "@xgovformbuilder/model";

export class NumberField extends FormComponent {
  schemaOptions: NumberFieldComponent["schema"];
  options: NumberFieldComponent["options"];

  constructor(def, model) {
    super(def, model);
    this.schemaOptions = def.schema;
    this.options = def.options;
    const { min, max } = def.schema;
    let schema = joi.number();

    schema = schema.label(def.title);

    if (def.schema?.min && def.schema?.max) {
      schema = schema.$;
    }
    if (def.schema?.min ?? false) {
      schema = schema.min(min);
    }

    if (def.schema?.max ?? false) {
      schema = schema.max(max);
    }

    if (def.options.customValidationMessage) {
      schema = schema.rule({ message: def.options.customValidationMessage });
    }

    if (def.options.required === false) {
      const optionalSchema = joi
        .alternatives()
        .try(joi.string().allow(null).allow("").default("").optional(), schema);
      this.schema = optionalSchema;
    } else {
      this.schema = schema;
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
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "number",
      prefix: { text: "" },
    };

    if (this.schemaOptions.precision) {
      viewModel.attributes.step = "0." + "1".padStart(schema.precision, "0");
    }

    if (options.prefix) {
      viewModel.prefix.text = options.prefix;
    }

    return viewModel;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state[this.name] || state[this.name] === 0
      ? state[this.name].toString()
      : undefined;
  }
}
