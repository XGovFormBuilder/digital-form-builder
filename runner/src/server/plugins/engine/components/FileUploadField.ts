import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";

import { DataType, ViewModel } from "./types";
import { FileUploadFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import joi, { Schema } from "joi";

export class FileUploadField extends FormComponent {
  dataType = "file" as DataType;

  constructor(def: FileUploadFieldComponent, model: FormModel) {
    super(def, model);

    const { options = {} } = def;

    let componentSchema = joi.string().label(def.title.toLowerCase());

    if (options.required === false) {
      componentSchema = componentSchema.allow("").allow(null);
    }

    componentSchema = componentSchema.messages({
      "string.empty": "Upload {{#label}}",
    });

    if (options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        options.customValidationMessages
      );
    }

    this.schema = componentSchema;
  }
  getFormSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  get attributes() {
    return {
      accept: "image/jpeg,image/gif,image/png,application/pdf",
    };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;
    const viewModel: ViewModel = {
      ...super.getViewModel(formData, errors),
      attributes: this.attributes,
    };

    if ("multiple" in options && options.multiple) {
      viewModel.attributes.multiple = "multiple";
    }

    return viewModel;
  }
}
