import { WebsiteFieldComponent } from "@xgovformbuilder/model";
import Joi, { StringSchema } from "joi";
import { FormModel } from "../models";
import { TextField } from "./TextField";
import { addClassOptionIfNone } from "./helpers";
import { FormData, FormSubmissionErrors } from "../types";
import { tr } from "date-fns/locale";

export class WebsiteField extends TextField {
  private defaultMessage =
    "Enter website address in the correct format, e.g. 'www.gov.uk'";

  formSchema: StringSchema;
  options: WebsiteFieldComponent["options"];
  schema: WebsiteFieldComponent["schema"];

  constructor(def: WebsiteFieldComponent, model: FormModel) {
    super(def, model);

    const { schema = {} } = def;
    this.options = def.options;
    this.schema = schema;
    this.formSchema = Joi.string();

    const isRequired = def.options.required ?? true;

    if (isRequired) {
      this.formSchema = this.formSchema.required();
    } else {
      this.formSchema = this.formSchema.allow("").allow(null);
    }

    this.formSchema = this.formSchema
      .label(def.title)
      .pattern(
        /^((https?|HTTPS?):\/\/)?(www\.)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?/
      )
      .message(def.options?.customValidationMessage ?? this.defaultMessage);

    if (schema.max) {
      this.formSchema = this.formSchema.max(schema.max);
    }

    if (schema.min) {
      this.formSchema = this.formSchema.min(schema.min);
    }

    addClassOptionIfNone(this.options, "govuk-input--width-10");
  }

  getFormSchemaKeys() {
    return {
      [this.name]: this.formSchema,
    };
  }

  getStateSchemaKeys() {
    return {
      [this.name]: this.formSchema,
    };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;
    const { prefix } = options;
    const viewModelPrefix = { prefix: { text: prefix } };
    const schema: any = this.schema;
    const viewModel = {
      ...super.getViewModel(formData, errors),
      type: "website",
      // ...False returns nothing, so only adds content when
      // the given options are present.
      ...(options.prefix && viewModelPrefix),
    };

    if (options.hideTitle) {
      viewModel.label = { text: "", html: viewModel.hint?.html!, classes: "" };
      viewModel.hint = { html: this.localisedString(this.hint) };
    }

    return viewModel;
  }
}
