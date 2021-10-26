import { WebsiteFieldComponent } from "@xgovformbuilder/model";
import Joi, { StringSchema } from "joi";
import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";
import { addClassOptionIfNone } from "./helpers";

export class WebsiteField extends FormComponent {
  public formSchema: StringSchema;

  public options: WebsiteFieldComponent["options"];

  public schema: WebsiteFieldComponent["schema"];

  constructor(def: WebsiteFieldComponent, model: FormModel) {
    super(def, model);

    this.formSchema = Joi.string().label(def.title).uri();

    this.options = def.options;

    this.schema = def.schema;

    const isRequired = def.options.required ?? true;

    if (isRequired) {
      this.formSchema = this.formSchema.required();
    } else {
      this.formSchema = this.formSchema.allow("").optional();
    }

    if (def.schema.max) {
      this.formSchema = this.formSchema.max(def.schema.max);
    }

    if (def.schema.min) {
      this.formSchema = this.formSchema.min(def.schema.min);
    }

    addClassOptionIfNone(this.options, "govuk-input--width-10");
  }

  public getFormSchemaKeys() {
    return {
      [this.name]: this.formSchema,
    };
  }

  public getStateSchemaKeys() {
    return {
      [this.name]: this.formSchema,
    };
  }

  public getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    if (this.options.autocomplete) {
      viewModel.autocomplete = this.options.autocomplete;
    }

    return viewModel;
  }
}
