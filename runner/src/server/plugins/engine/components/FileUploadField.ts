import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";
import * as helpers from "./helpers";

import { DataType, ViewModel } from "./types";
import joi from "joi";

export class FileUploadField extends FormComponent {
  dataType = "file" as DataType;
  getFormSchemaKeys() {
    return {
      [this.name]: joi.alternatives().conditional(`${this.name}__filename`, {
        is: joi.exist(),
        then: joi.string().optional().allow("").allow(null),
        otherwise: joi.string(),
      }),
      [`${this.name}__filename`]: joi.string().optional(),
    };
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  get attributes() {
    return {
      accept:
        "image/jpeg,image/gif,image/png,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.text,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  getFileNameFromState(state: FormData) {
    let fileName = state[this.name];
    if (typeof fileName !== "undefined") {
      let value = fileName.split("/");
      fileName = value[value.length - 1];
    }
    return fileName;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;
    const viewModel: ViewModel = {
      ...super.getViewModel(formData, errors),
      attributes: this.attributes,
      filename: this.getFileNameFromState(formData) ?? "",
    };

    if ("multiple" in options && options.multiple) {
      viewModel.attributes.multiple = "multiple";
    }

    return viewModel;
  }
}
