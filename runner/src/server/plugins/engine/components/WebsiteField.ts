import { WebsiteFieldComponent } from "@xgovformbuilder/model";
import Joi, { StringSchema } from "joi";
import { FormModel } from "../models";
import { TextField } from "./TextField";
import { addClassOptionIfNone } from "./helpers";

export class WebsiteField extends TextField {
  private defaultMessage =
    "Enter website address in the correct format, starting with 'https://'";

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
      .uri()
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
}
