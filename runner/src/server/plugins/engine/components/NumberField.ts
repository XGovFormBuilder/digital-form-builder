import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import joi, { Schema } from "joi";

export class NumberField extends FormComponent {
  constructor(def, model) {
    super(def, model);
    const { min, max } = def.schema;
    let schema = joi.number().label(def.title);

    if (!!min && !!max) {
      schema = schema.$;
    }
    if (!!min) {
      schema = schema.min(min);
    }
    if (!!max) {
      schema = schema.max(max);
    }

    if (def.options.customValidationMessage) {
      schema = schema.rule({ message: def.options.customValidationMessage });
    }

    this.schema = schema;
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
      type: "number",
    };

    if (schema.precision) {
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
