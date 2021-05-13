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
import { Schema } from "joi";

export class TextField extends FormComponent {
  formSchema;
  stateSchema;
  options: TextFieldComponent["options"];

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    this.options = def.options;

    addClassOptionIfNone(this.options, "govuk-input--width-20");

    const { schema } = this;
    if (!schema["regex"]) {
      schema["regex"] = '^[^"\\/\\#;]*$';
    }

    this.formSchema = buildFormSchema("string", this);
    this.stateSchema = buildStateSchema("string", this);
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
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
